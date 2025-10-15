import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabaseClient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type EmailVerificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EmailConfirmation'>;

export default function EmailVerificationScreen() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verifying your email...');
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<EmailVerificationScreenNavigationProp>();

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = new URL(event.url);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      const type = url.searchParams.get('type');

      if (type === 'signup' && accessToken && refreshToken) {
        try {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          if (data?.user) {
            setMessage('Email verified successfully!');
            // Optionally sign out the user after verification
            await supabase.auth.signOut();
          }
        } catch (err) {
          console.error('Error verifying email:', err);
          setError('Failed to verify email. The link may have expired or is invalid.');
        } finally {
          setLoading(false);
        }
      }
    };

    // Handle the initial URL if the app was opened from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      } else {
        setLoading(false);
        setError('No verification data found. Please try the link from your email again.');
      }
    });

    // Add event listener for when the app is already open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.message}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={[styles.message, styles.error]}>{error}</Text>
          <Text 
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Back to Login
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.message}>✅ {message}</Text>
          <Text 
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Continue to Login
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F8F5',
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#2E7D32',
  },
  error: {
    color: '#D32F2F',
  },
  link: {
    color: '#1976D2',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});
