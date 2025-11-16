-- Migration: Post Interaction Notifications (likes/comments)
-- Creates notifications table, RLS, realtime publication, and triggers

-- 1) Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like','comment','follow','friend_request','system')),
  target_type TEXT DEFAULT 'post',
  target_id UUID,
  content TEXT,
  message TEXT,
  post_image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created_at 
  ON public.notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
  ON public.notifications(recipient_id, is_read) WHERE is_read = FALSE;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow recipients to read their notifications
DROP POLICY IF EXISTS "Notifications readable by recipient" ON public.notifications;
CREATE POLICY "Notifications readable by recipient"
  ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid());

-- Allow recipients to mark their notifications read
DROP POLICY IF EXISTS "Recipients can update read flags" ON public.notifications;
CREATE POLICY "Recipients can update read flags"
  ON public.notifications FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Do NOT allow public inserts; inserts are performed by SECURITY DEFINER functions via triggers

-- 2) Realtime: add table to publication (idempotent)
DO $$
BEGIN
  -- This may error if already added; ignore errors
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications';
  EXCEPTION WHEN others THEN
    -- ignore if already present
    NULL;
  END;
  -- Ensure interaction tables are published as well
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_likes';
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments';
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.likes';
  EXCEPTION WHEN others THEN NULL; END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.comments';
  EXCEPTION WHEN others THEN NULL; END;
END$$;

-- 3) Helper: safe username lookup
CREATE OR REPLACE FUNCTION public._get_username(u UUID)
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT COALESCE((SELECT username FROM public.profiles p WHERE p.id = u), 'Someone')
$$;

-- 4) Insert function (SECURITY DEFINER) for notifications
CREATE OR REPLACE FUNCTION public._create_notification(
  _actor UUID,
  _recipient UUID,
  _type TEXT,
  _target_type TEXT,
  _target_id UUID,
  _message TEXT,
  _post_image_url TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _actor IS NULL OR _recipient IS NULL OR _actor = _recipient THEN
    RETURN;
  END IF;
  INSERT INTO public.notifications(actor_id, recipient_id, type, target_type, target_id, message, content, post_image_url)
  VALUES (_actor, _recipient, _type, _target_type, _target_id, _message, _message, _post_image_url);
END;
$$;

-- 5) Trigger functions for forum posts
-- 5a) Likes on forum_posts with column forum_post_id
CREATE OR REPLACE FUNCTION public.notify_forum_like_forum_post_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  owner UUID;
  actor_name TEXT;
BEGIN
  SELECT fp.user_id INTO owner FROM public.forum_posts fp WHERE fp.id = NEW.forum_post_id;
  IF owner IS NULL OR owner = NEW.user_id THEN RETURN NEW; END IF;
  actor_name := public._get_username(NEW.user_id);
  PERFORM public._create_notification(NEW.user_id, owner, 'like', 'post', NEW.forum_post_id,
    '@' || actor_name || ' liked your post', NULL);
  RETURN NEW;
END;$$;

-- 5b) Likes on forum_posts with column post_id (legacy)
CREATE OR REPLACE FUNCTION public.notify_forum_like_post_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  owner UUID;
  actor_name TEXT;
BEGIN
  SELECT fp.user_id INTO owner FROM public.forum_posts fp WHERE fp.id = NEW.post_id;
  IF owner IS NULL OR owner = NEW.user_id THEN RETURN NEW; END IF;
  actor_name := public._get_username(NEW.user_id);
  PERFORM public._create_notification(NEW.user_id, owner, 'like', 'post', NEW.post_id,
    '@' || actor_name || ' liked your post', NULL);
  RETURN NEW;
END;$$;

-- 5c) Comments on forum_posts with column forum_post_id
CREATE OR REPLACE FUNCTION public.notify_forum_comment_forum_post_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  owner UUID;
  actor_name TEXT;
BEGIN
  SELECT fp.user_id INTO owner FROM public.forum_posts fp WHERE fp.id = NEW.forum_post_id;
  IF owner IS NULL OR owner = NEW.user_id THEN RETURN NEW; END IF;
  actor_name := public._get_username(NEW.user_id);
  PERFORM public._create_notification(NEW.user_id, owner, 'comment', 'post', NEW.forum_post_id,
    '@' || actor_name || ' commented on your post', NULL);
  RETURN NEW;
END;$$;

-- 5d) Comments on forum_posts with column post_id (legacy)
CREATE OR REPLACE FUNCTION public.notify_forum_comment_post_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  owner UUID;
  actor_name TEXT;
BEGIN
  SELECT fp.user_id INTO owner FROM public.forum_posts fp WHERE fp.id = NEW.post_id;
  IF owner IS NULL OR owner = NEW.user_id THEN RETURN NEW; END IF;
  actor_name := public._get_username(NEW.user_id);
  PERFORM public._create_notification(NEW.user_id, owner, 'comment', 'post', NEW.post_id,
    '@' || actor_name || ' commented on your post', NULL);
  RETURN NEW;
END;$$;

-- 6) Trigger functions for generic posts (public.posts)
CREATE OR REPLACE FUNCTION public.notify_like_posts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  owner UUID;
  actor_name TEXT;
BEGIN
  SELECT p.user_id INTO owner FROM public.posts p WHERE p.id = NEW.post_id;
  IF owner IS NULL OR owner = NEW.user_id THEN RETURN NEW; END IF;
  actor_name := public._get_username(NEW.user_id);
  PERFORM public._create_notification(NEW.user_id, owner, 'like', 'post', NEW.post_id,
    '@' || actor_name || ' liked your post', NULL);
  RETURN NEW;
END;$$;

CREATE OR REPLACE FUNCTION public.notify_comment_posts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  owner UUID;
  actor_name TEXT;
BEGIN
  SELECT p.user_id INTO owner FROM public.posts p WHERE p.id = NEW.post_id;
  IF owner IS NULL OR owner = NEW.user_id THEN RETURN NEW; END IF;
  actor_name := public._get_username(NEW.user_id);
  PERFORM public._create_notification(NEW.user_id, owner, 'comment', 'post', NEW.post_id,
    '@' || actor_name || ' commented on your post', NULL);
  RETURN NEW;
END;$$;

-- 7) Create triggers conditionally depending on schema variants
DO $$
DECLARE
  has_forum_likes BOOLEAN;
  has_forum_likes_forum_post_id BOOLEAN;
  has_forum_likes_post_id BOOLEAN;
  has_forum_comments BOOLEAN;
  has_forum_comments_forum_post_id BOOLEAN;
  has_forum_comments_post_id BOOLEAN;
  has_likes BOOLEAN;
  has_comments BOOLEAN;
BEGIN
  -- forum_likes table exists?
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='forum_likes') INTO has_forum_likes;
  IF has_forum_likes THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='forum_likes' AND column_name='forum_post_id'
    ) INTO has_forum_likes_forum_post_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='forum_likes' AND column_name='post_id'
    ) INTO has_forum_likes_post_id;

    -- Drop old triggers if present
    EXECUTE 'DROP TRIGGER IF EXISTS trg_notify_forum_like_forum_post_id ON public.forum_likes';
    EXECUTE 'DROP TRIGGER IF EXISTS trg_notify_forum_like_post_id ON public.forum_likes';

    IF has_forum_likes_forum_post_id THEN
      EXECUTE 'CREATE TRIGGER trg_notify_forum_like_forum_post_id AFTER INSERT ON public.forum_likes FOR EACH ROW EXECUTE FUNCTION public.notify_forum_like_forum_post_id()';
    ELSIF has_forum_likes_post_id THEN
      EXECUTE 'CREATE TRIGGER trg_notify_forum_like_post_id AFTER INSERT ON public.forum_likes FOR EACH ROW EXECUTE FUNCTION public.notify_forum_like_post_id()';
    END IF;
  END IF;

  -- forum_comments table exists?
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='forum_comments') INTO has_forum_comments;
  IF has_forum_comments THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='forum_comments' AND column_name='forum_post_id'
    ) INTO has_forum_comments_forum_post_id;
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema='public' AND table_name='forum_comments' AND column_name='post_id'
    ) INTO has_forum_comments_post_id;

    -- Drop old triggers if present
    EXECUTE 'DROP TRIGGER IF EXISTS trg_notify_forum_comment_forum_post_id ON public.forum_comments';
    EXECUTE 'DROP TRIGGER IF EXISTS trg_notify_forum_comment_post_id ON public.forum_comments';

    IF has_forum_comments_forum_post_id THEN
      EXECUTE 'CREATE TRIGGER trg_notify_forum_comment_forum_post_id AFTER INSERT ON public.forum_comments FOR EACH ROW EXECUTE FUNCTION public.notify_forum_comment_forum_post_id()';
    ELSIF has_forum_comments_post_id THEN
      EXECUTE 'CREATE TRIGGER trg_notify_forum_comment_post_id AFTER INSERT ON public.forum_comments FOR EACH ROW EXECUTE FUNCTION public.notify_forum_comment_post_id()';
    END IF;
  END IF;

  -- generic likes table
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='likes') INTO has_likes;
  IF has_likes THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_notify_like_posts ON public.likes';
    EXECUTE 'CREATE TRIGGER trg_notify_like_posts AFTER INSERT ON public.likes FOR EACH ROW EXECUTE FUNCTION public.notify_like_posts()';
  END IF;

  -- generic comments table
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='comments') INTO has_comments;
  IF has_comments THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_notify_comment_posts ON public.comments';
    EXECUTE 'CREATE TRIGGER trg_notify_comment_posts AFTER INSERT ON public.comments FOR EACH ROW EXECUTE FUNCTION public.notify_comment_posts()';
  END IF;
END$$;

-- Done
