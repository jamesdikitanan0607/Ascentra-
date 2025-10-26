import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHomepageSpots } from '../../data/hikingSpotsAdapter';
import { HikingSpotWithSource } from '../../types/forum';

interface Props {
  visible: boolean;
  query: string;
  onSelect: (spot: { id: string; name: string }) => void;
}

const MentionDropdown: React.FC<Props> = ({ visible, query, onSelect }) => {
  const spots = useMemo<HikingSpotWithSource[]>(() => getHomepageSpots(), []);

  const filtered = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return spots;
    return spots.filter(s => s.name.toLowerCase().includes(q));
  }, [spots, query]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => onSelect({ id: item.id, name: item.name })}>
            <Image source={item.thumbnailSource} style={styles.thumb} />
            <Text style={styles.name}>@{item.name}</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <Text style={styles.emptyText}>No matching spots</Text>
          </View>
        }
      />
    </View>
  );
};

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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  thumb: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F3F4F6' },
  name: { color: '#111827', fontWeight: '600' },
  empty: { padding: 12, alignItems: 'center', flexDirection: 'row', gap: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 12 },
});

export default MentionDropdown;
