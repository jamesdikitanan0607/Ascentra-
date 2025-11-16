import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationBellProps {
  count?: number;
  onPress?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ 
  count = 0, 
  onPress = () => {} 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const hasUnread = count > 0;

  const handlePress = () => {
    // Trigger the animation when the bell is pressed
    if (!isAnimating) {
      setIsAnimating(true);
      
      // Create a spring animation for a subtle bounce effect
      Animated.sequence([
        // Scale down and rotate slightly
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0.2,
            duration: 100,
            useNativeDriver: true,
          })
        ]),
        // Bounce back with overshoot
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 400,
          useNativeDriver: true,
        }),
        // Return to original rotation
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        setIsAnimating(false);
      });
    }
    
    // Call the onPress handler
    onPress();
  };

  // Animation for the bell icon
  const bellStyle = {
    transform: [
      { scale: scaleAnim },
      {
        rotate: rotateAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '30deg']
        })
      }
    ]
  };

  // Animation for the badge
  const badgeScale = hasUnread 
    ? rotateAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1]
      })
    : 0;

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={styles.container}
      activeOpacity={0.7}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
      <Animated.View style={[styles.bellContainer, bellStyle]}>
        <Ionicons 
          name="notifications-outline" 
          size={24} 
          color={hasUnread ? '#2E7D32' : '#4B5563'} 
        />
      </Animated.View>
      
      {hasUnread && (
        <Animated.View 
          style={[
            styles.badge,
            { 
              transform: [{ scale: badgeScale }],
              opacity: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.8]
              })
            }
          ]}
        >
          <Text style={styles.badgeText}>
            {count > 9 ? '9+' : count}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#2E7D32',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FAFAF7',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default NotificationBell;
