
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        'http://192.168.1.104:8080/api/test'
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP Hatası: ${response.status}`);
      }

      setMessage(data);
    } catch (error) {
      setMessage('Backend bağlantısı başarısız!');
      console.log('Bağlantı hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.navigation}>
          <NavigationContainer>
            <TabNavigator />
          </NavigationContainer>
        </View>

        <View style={styles.testArea}>
          <Button
            title="Backend Bağlantısını Test Et"
            onPress={testConnection}
            disabled={loading}
          />

          {loading && (
            <ActivityIndicator
              size="small"
              style={styles.loader}
            />
          )}

          {message !== '' && (
            <Text style={styles.message}>{message}</Text>
          )}
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  navigation: {
    flex: 1,
  },
  testArea: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#ECEBF2',
  },
  loader: {
    marginTop: 8,
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
