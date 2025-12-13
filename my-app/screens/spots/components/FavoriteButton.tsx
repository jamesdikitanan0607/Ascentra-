import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';

interface FavoriteButtonProps {
  isFavorite: boolean;
  isLoading: boolean;
  onPress: () => void;
  style?: object;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  isLoading,
  onPress,
  style,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.button, style, styles.loadingButton]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={isLoading}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={20}
        color="white"
      />
      <Text style={styles.buttonText}>
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24, // Pill shape
    marginVertical: 8,
    backgroundColor: '#388E3C', // Primary green
  },
  loadingButton: {
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
