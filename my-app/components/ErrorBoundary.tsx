import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#388E3C',
  background: '#FFFFFF',
  text: '#2E2E2E',
  textLight: '#757575',
  error: '#F44336',
  card: '#F9F9F9',
  separator: '#EEEEEE',
};

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  navigation?: any;
  screenName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    this.logError(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: any) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      screenName: this.props.screenName || 'Unknown',
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
    };

    console.error('Error Boundary Log:', JSON.stringify(errorData, null, 2));
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  private handleGoBack = () => {
    if (this.props.navigation) {
      this.props.navigation.goBack();
    }
  };

  private handleGoHome = () => {
    if (this.props.navigation) {
      this.props.navigation.navigate('Home');
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={80} color={COLORS.error} />
            
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            
            <Text style={styles.errorMessage}>
              We encountered an unexpected error while loading this screen.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info:</Text>
                <Text style={styles.debugText} numberOfLines={5}>
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {this.state.retryCount < this.maxRetries && (
                <TouchableOpacity 
                  style={[styles.button, styles.retryButton]}
                  onPress={this.handleRetry}
                >
                  <MaterialIcons name="refresh" size={20} color="white" />
                  <Text style={styles.buttonText}>
                    Try Again ({this.maxRetries - this.state.retryCount} left)
                  </Text>
                </TouchableOpacity>
              )}

              {this.props.navigation && (
                <>
                  <TouchableOpacity 
                    style={[styles.button, styles.backButton]}
                    onPress={this.handleGoBack}
                  >
                    <MaterialIcons name="arrow-back" size={20} color={COLORS.primary} />
                    <Text style={[styles.buttonText, styles.backButtonText]}>Go Back</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.button, styles.homeButton]}
                    onPress={this.handleGoHome}
                  >
                    <MaterialIcons name="home" size={20} color={COLORS.primary} />
                    <Text style={[styles.buttonText, styles.homeButtonText]}>Go Home</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {this.state.retryCount >= this.maxRetries && (
              <Text style={styles.maxRetriesText}>
                Maximum retry attempts reached. Please restart the app or contact support.
              </Text>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  debugContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxHeight: 120,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  debugText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    minHeight: 48,
    gap: 8,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  backButtonText: {
    color: COLORS.primary,
  },
  homeButtonText: {
    color: COLORS.primary,
  },
  maxRetriesText: {
    fontSize: 14,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
});

export default ErrorBoundary;