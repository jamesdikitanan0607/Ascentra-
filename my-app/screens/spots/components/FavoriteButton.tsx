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
      style={[
        styles.button,
        style,
        isFavorite ? styles.favoritedButton : styles.defaultButton,
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={20}
        color={isFavorite ? COLORS.error : COLORS.primary}
      />
      <Text
        style={[
          styles.buttonText,
          { backgroundColor: isFavorite ? COLORS.error : COLORS.white },
        ]}
      >
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
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  defaultButton: {
    backgroundColor: 'white',
    borderColor: COLORS.primary,
  },
  favoritedButton: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderColor: COLORS.error,
  },
  loadingButton: {
    backgroundColor: 'white',
    borderColor: COLORS.lightGray,
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});
