-- Ensure notify trigger functions run with elevated privileges to bypass RLS when reading owners

-- Forum likes (forum_post_id)
CREATE OR REPLACE FUNCTION public.notify_forum_like_forum_post_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Forum likes (post_id legacy)
CREATE OR REPLACE FUNCTION public.notify_forum_like_post_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Forum comments (forum_post_id)
CREATE OR REPLACE FUNCTION public.notify_forum_comment_forum_post_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Forum comments (post_id legacy)
CREATE OR REPLACE FUNCTION public.notify_forum_comment_post_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Generic posts likes
CREATE OR REPLACE FUNCTION public.notify_like_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Generic posts comments
CREATE OR REPLACE FUNCTION public.notify_comment_posts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
