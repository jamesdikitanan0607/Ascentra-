import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  SectionList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrailWithSpot, DIFFICULTY_COLORS } from '../services/trailService';
import TrailCard from './TrailCard';

interface TrailListProps {
  trails: TrailWithSpot[];
  selectedTrail?: TrailWithSpot | null;
  onTrailSelect: (trail: TrailWithSpot) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedDifficulties?: string[];
  onDifficultyFilter?: (difficulties: string[]) => void;
}

interface TrailSection {
  title: string;
  data: TrailWithSpot[];
}

const DIFFICULTIES = ['Easy', 'Moderate', 'Hard', 'Advanced'];

export default function TrailList({
  trails,
  selectedTrail,
  onTrailSelect,
  searchQuery = '',
  onSearchChange,
  selectedDifficulties = [],
  onDifficultyFilter,
}: TrailListProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Group trails by mountain and filter
  const trailSections = useMemo(() => {
    let filteredTrails = trails;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTrails = filteredTrails.filter(
        trail =>
          trail.name.toLowerCase().includes(query) ||
          trail.hiking_spot_name.toLowerCase().includes(query) ||
          trail.highlights.toLowerCase().includes(query)
      );
    }

    // Filter by difficulty
    if (selectedDifficulties.length > 0) {
      filteredTrails = filteredTrails.filter(trail =>
        selectedDifficulties.includes(trail.difficulty)
      );
    }

    // Group by mountain
    const grouped = filteredTrails.reduce((acc, trail) => {
      const mountain = trail.hiking_spot_name;
      if (!acc[mountain]) {
        acc[mountain] = [];
      }
      acc[mountain].push(trail);
      return acc;
    }, {} as Record<string, TrailWithSpot[]>);

    // Convert to sections array and sort
    return Object.entries(grouped)
      .map(([title, data]) => ({
        title,
        data: data.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [trails, searchQuery, selectedDifficulties]);

  const toggleDifficultyFilter = (difficulty: string) => {
    if (!onDifficultyFilter) return;

    const newSelected = selectedDifficulties.includes(difficulty)
      ? selectedDifficulties.filter(d => d !== difficulty)
      : [...selectedDifficulties, difficulty];

    onDifficultyFilter(newSelected);
  };

  const clearFilters = () => {
    onSearchChange?.('');
    onDifficultyFilter?.([]);
  };

  const renderSectionHeader = ({ section }: { section: TrailSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>
        {section.data.length} trail{section.data.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  const renderTrailItem = ({ item }: { item: TrailWithSpot }) => (
    <TrailCard
      trail={item}
      isSelected={selectedTrail?.id === item.id}
      onPress={() => onTrailSelect(item)}
    />
  );

  const renderDifficultyFilter = () => (
    <View style={styles.difficultyFilters}>
      {DIFFICULTIES.map(difficulty => {
        const isSelected = selectedDifficulties.includes(difficulty);
        const color = DIFFICULTY_COLORS[difficulty];

        return (
          <TouchableOpacity
            key={difficulty}
            style={[
              styles.difficultyChip,
              { borderColor: color },
              isSelected && { backgroundColor: color },
            ]}
            onPress={() => toggleDifficultyFilter(difficulty)}
          >
            <Text
              style={[
                styles.difficultyChipText,
                { color: isSelected ? '#fff' : color },
              ]}
            >
              {difficulty}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const hasActiveFilters = searchQuery.trim() || selectedDifficulties.length > 0;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search trails or mountains..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => onSearchChange?.('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            showFilters && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name="options"
            size={20}
            color={showFilters ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filter by Difficulty</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          {renderDifficultyFilter()}
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {trailSections.reduce((total, section) => total + section.data.length, 0)} trails
          {hasActiveFilters && ' found'}
        </Text>
      </View>

      {/* Trail List */}
      <SectionList
        sections={trailSections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTrailItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="trail-sign" size={48} color="#ccc" />
            <Text style={styles.emptyTitle}>No trails found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f4',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#e3f2fd',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  difficultyFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  difficultyChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});