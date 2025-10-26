import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';

export default function MentionSpotDropdown({ visible, query, onSelect, spots: spotsProp }) {
  const [spots, setSpots] = useState(spotsProp || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadSpots() {
      if (spotsProp && spotsProp.length) {
        setSpots(spotsProp);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('hiking_spots')
          .select('id, name, cover_image_url, image_url, thumbnail_url')
          .limit(30);
        if (!cancelled) {
          if (error) throw error;
          setSpots(data || []);
        }
      } catch (e) {
        try {
          const fallback = require('../data/hikingSpots.json');
          console.warn('Failed to fetch spots — using local fallback.');
          if (!cancelled) setSpots(fallback || []);
        } catch (_) {}
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSpots();
    return () => { cancelled = true; };
  }, [spotsProp]);

  const filtered = useMemo(() => {
    if (!Array.isArray(spots)) return [];
    const q = (query || '').trim().toLowerCase();
    if (!q) return spots;
    return spots.filter(s => (s.name || '').toLowerCase().includes(q));
  }, [spots, query]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingRow}>
          <Ionicons name="hourglass" size={14} color="#6B7280" />
          <Text style={styles.loadingText}>Loading spots…</Text>
        </View>
      )}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelect?.({ id: item.id, name: item.name, thumbnail_url: item.thumbnail_url || item.cover_image_url || item.image_url })}
          >
            <Image
              source={{ uri: item.thumbnail_url || item.cover_image_url || item.image_url || 'https://via.placeholder.com/40x40?text=+' }}
              style={styles.thumb}
            />
            <Text style={styles.name}>@{item.name}</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}> 
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <Text style={styles.emptyText}>No matching spots</Text>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 280,
    overflow: 'hidden',
    zIndex: 100,
  },
  loadingRow: { flexDirection: 'row', gap: 6, padding: 8, alignItems: 'center' },
  loadingText: { color: '#6B7280', fontSize: 12 },
  item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6' },
  name: { color: '#111827', fontWeight: '600' },
  empty: { padding: 12, alignItems: 'center', flexDirection: 'row', gap: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 12 },
});
