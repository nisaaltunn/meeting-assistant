
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  navigation: {
    navigate: (screen: 'Register') => void;
  };
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('E-posta ve şifre alanlarını doldurun.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await login({
        email: email.trim(),
        password,
      });

    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Giriş yapılırken hata oluştu.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Meeting Assistant</Text>
          <Text style={styles.subtitle}>
            Toplantılarınızı daha verimli yönetin.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Hoş Geldiniz</Text>
          <Text style={styles.description}>
            Hesabınıza giriş yaparak devam edin.
          </Text>

          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi girin"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error !== '' && (
            <Text style={styles.error}>{error}</Text>
          )}

          <Pressable
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Giriş Yap</Text>
            )}
          </Pressable>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Henüz hesabınız yok mu?
            </Text>

            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}> Kayıt Ol</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FC',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 45,
  },
  logo: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#6558D3',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#777',
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#25233A',
  },
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E1EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#25233A',
    backgroundColor: '#FFFFFF',
  },
  error: {
    color: '#D93636',
    fontSize: 13,
    marginTop: 14,
  },
  button: {
    height: 52,
    backgroundColor: '#6558D3',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#777',
    fontSize: 14,
  },
  registerLink: {
    color: '#6558D3',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
