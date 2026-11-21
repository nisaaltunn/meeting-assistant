
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../theme/colors';

const settings = [
  { title: 'Hesap Bilgileri', icon: 'person-outline' },
  { title: 'Bildirimler', icon: 'notifications-outline' },
  { title: 'Dil ve Görünüm', icon: 'color-palette-outline' },
  { title: 'Gizlilik ve Güvenlik', icon: 'shield-checkmark-outline' },
  { title: 'Yardım ve Destek', icon: 'help-circle-outline' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profilim</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={40}
              color={colors.primary}
            />
          </View>

          <Text style={styles.name}>Kullanıcı Adı</Text>
          <Text style={styles.email}>ornek@email.com</Text>
        </View>

        <Text style={styles.sectionTitle}>
          Ayarlar
        </Text>

        {settings.map((item, index) => (
          <View style={styles.setting} key={index}>
            <Ionicons
              name={item.icon as any}
              size={22}
              color={colors.primary}
            />

            <Text style={styles.settingText}>
              {item.title}
            </Text>

            <Ionicons
              name="chevron-forward"
              size={19}
              color={colors.secondaryText}
            />
          </View>
        ))}
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
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    padding: 25,
    borderRadius: 20,
    marginTop: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 45,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: colors.text,
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 15,
  },
  email: {
    color: colors.secondaryText,
    marginTop: 6,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 15,
  },
  setting: {
    backgroundColor: colors.surface,
    padding: 17,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 13,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
});

