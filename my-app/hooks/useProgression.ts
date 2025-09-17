import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export interface UserProgression {
  level: number;
  experience: number;
  experienceToNext: number;
  totalHikes: number;
  totalDistance: number;
  totalElevation: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'distance' | 'elevation' | 'hikes' | 'special';
}

export function useProgression() {
  const [progression, setProgression] = useState<UserProgression>({
    level: 1,
    experience: 0,
    experienceToNext: 100,
    totalHikes: 0,
    totalDistance: 0,
    totalElevation: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgression = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Fetch user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      // Fetch achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id);

      if (achievementsError) {
        throw achievementsError;
      }

      // Calculate level and experience
      const totalDistance = stats?.total_distance || 0;
      const totalElevation = stats?.total_elevation || 0;
      const totalHikes = stats?.total_hikes || 0;
      
      const experience = Math.floor(totalDistance / 1000) + Math.floor(totalElevation / 100) + (totalHikes * 10);
      const level = Math.floor(experience / 100) + 1;
      const experienceToNext = (level * 100) - experience;

      setProgression({
        level,
        experience,
        experienceToNext,
        totalHikes,
        totalDistance,
        totalElevation,
        achievements: achievements?.map(ua => ({
          id: ua.achievement.id,
          title: ua.achievement.title,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          unlockedAt: ua.unlocked_at,
          category: ua.achievement.category
        })) || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch progression');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = async (points: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update user stats
      const { error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_experience: progression.experience + points,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh progression
      await fetchProgression();
    } catch (err) {
      console.error('Error adding experience:', err);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          unlocked_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh progression
      await fetchProgression();
    } catch (err) {
      console.error('Error unlocking achievement:', err);
    }
  };

  useEffect(() => {
    fetchProgression();
  }, []);

  return {
    progression,
    loading,
    error,
    refetch: fetchProgression,
    addExperience,
    unlockAchievement
  };
}