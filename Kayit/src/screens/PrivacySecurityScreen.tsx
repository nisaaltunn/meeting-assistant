
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { changePassword } from '../services/authService';
import colors from '../theme/colors';

export default function PrivacySecurityScreen({ navigation }: any) {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Eksik bilgi', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Geçersiz şifre', 'Yeni şifre en az 8 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Şifreler eşleşmiyor', 'Yeni şifre ve tekrarı aynı olmalıdır.');
      return;
    }

    if (!user?.token) {
      Alert.alert('Hata', 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }

    try {
      setLoading(true);

      await changePassword(
        { currentPassword, newPassword },
        user.token
      );

      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert(
        'Şifre değiştirilemedi',
        error.message || 'Bir hata oluştu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={styles.backText}>Geri</Text>
        </Pressable>

        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark-outline" size={36} color={colors.primary} />
        </View>

        <Text style={styles.title}>Gizlilik ve Güvenlik</Text>
        <Text style={styles.description}>
          Hesabının güvenliği için şifreni buradan değiştirebilirsin.
        </Text>

        <Text style={styles.sectionTitle}>Şifre Değiştir</Text>

        <Text style={styles.label}>Mevcut Şifre</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Mevcut şifrenizi girin"
          placeholderTextColor={colors.secondaryText}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Yeni Şifre</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Yeni şifrenizi girin"
          placeholderTextColor={colors.secondaryText}
          secureTextEntry
          autoCapitalize="none"
        />

        <Text style={styles.label}>Yeni Şifre Tekrar</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Yeni şifrenizi tekrar girin"
          placeholderTextColor={colors.secondaryText}
          secureTextEntry
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Şifremi Değiştir</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 21,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 18,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
