import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../styles/colors';

export const LeaveNoTraceSection = () => {
    const principles = [
        'Plan ahead & prepare',
        'Travel on durable surfaces',
        'Dispose of waste properly',
        'Leave what you find',
        'Minimize campfire impact',
        'Respect wildlife',
        'Be considerate of other hikers',
    ];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leave No Trace Practices</Text>
            <View style={styles.container}>
                {principles.map((principle, index) => (
                    <View key={index} style={styles.item}>
                        <Ionicons name="leaf" size={16} color={COLORS.primary} />
                        <Text style={styles.text}>{principle}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 28,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 12,
        // Matching the font family from HikingSpotTemplate if possible, or letting it inherit
    },
    container: {
        backgroundColor: '#F0F7F0', // Light green background for emphasis, similar to tips but distinct
        borderRadius: 12,
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        lineHeight: 22,
        color: COLORS.text,
        marginLeft: 12,
        flex: 1,
    },
});
