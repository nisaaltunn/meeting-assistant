
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

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: 'Login') => void;
  };
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password
    ) {
      setError('Lütfen bütün alanları doldurun.');
      return;
    }

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kayıt oluşturulamadı.',
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
        <View style={styles.header}>
          <Text style={styles.logo}>Meeting Assistant</Text>
          <Text style={styles.subtitle}>
            Yeni hesabınızı oluşturun.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Kayıt Ol</Text>
          <Text style={styles.description}>
            Toplantı asistanınızı kullanmaya başlayın.
          </Text>

          <Text style={styles.label}>Ad</Text>
          <TextInput
            style={styles.input}
            placeholder="Adınız"
            placeholderTextColor="#999"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Soyad</Text>
          <TextInput
            style={styles.input}
            placeholder="Soyadınız"
            placeholderTextColor="#999"
            value={lastName}
            onChangeText={setLastName}
          />

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
            placeholder="En az 8 karakter"
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Hesap Oluştur</Text>
            )}
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Zaten hesabınız var mı?
            </Text>

            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}> Giriş Yap</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#6558D3',
  },
  subtitle: {
    marginTop: 8,
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
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    height: 49,
    borderWidth: 1,
    borderColor: '#E2E1EA',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#25233A',
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
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  loginText: {
    color: '#777',
    fontSize: 14,
  },
  loginLink: {
    color: '#6558D3',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
