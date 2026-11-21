
import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../theme/colors';

export default function HomeScreen({ navigation }: any) {
  const meetings = [
    {
      title: 'Proje toplantısı',
      date: '18 Kasım 2026',
      duration: '35 dakika',
      icon: 'people-outline',
    },
    {
      title: 'Ders çalışma notları',
      date: '17 Kasım 2026',
      duration: '22 dakika',
      icon: 'book-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              MERHABA 👋
            </Text>

            <Text style={styles.title}>
              Konuştuklarımız
            </Text>
          </View>

          <TouchableOpacity style={styles.profileButton}>
            <Ionicons
              name="person-outline"
              size={23}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.cardLabel}>
            AI MEETING ASSISTANT
          </Text>

          <Text style={styles.welcomeTitle}>
            Hiçbir önemli detayı kaçırma.
          </Text>

          <Text style={styles.welcomeDescription}>
            Konuşmalarını kaydet, yazıya dönüştür
            ve yapay zekâ ile analiz et.
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate('Kayıt')}
          >
            <Ionicons
              name="mic"
              size={21}
              color={colors.primary}
            />

            <Text style={styles.startButtonText}>
              Yeni kayıt başlat
            </Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>
          Hızlı İşlemler
        </Text>

        <View style={styles.quickActions}>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Kayıt')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="mic-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionTitle}>
              Ses Kaydet
            </Text>

            <Text style={styles.actionDescription}>
              Canlı kayıt başlat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Kayıt')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="cloud-upload-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionTitle}>
              Dosya Yükle
            </Text>

            <Text style={styles.actionDescription}>
              Ses dosyanı seç
            </Text>
          </TouchableOpacity>

        </View>

        {/* Recent Meetings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Son Toplantılar
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Toplantılar')}
          >
            <Text style={styles.seeAll}>
              Tümünü gör
            </Text>
          </TouchableOpacity>
        </View>

        {meetings.map((meeting, index) => (
          <TouchableOpacity
            key={index}
            style={styles.meetingCard}
            onPress={() => navigation.navigate('Toplantılar')}
          >
            <View style={styles.meetingIcon}>
              <Ionicons
                name={meeting.icon as any}
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle}>
                {meeting.title}
              </Text>

              <Text style={styles.meetingDate}>
                {meeting.date} · {meeting.duration}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.secondaryText}
            />
          </TouchableOpacity>
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

  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  greeting: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: '600',
    letterSpacing: 1,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 5,
  },

  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  welcomeCard: {
    backgroundColor: colors.primary,
    padding: 22,
    borderRadius: 22,
    marginBottom: 28,
  },

  cardLabel: {
    color: '#DCD3FF',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  welcomeTitle: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 17,
    lineHeight: 33,
  },

  welcomeDescription: {
    color: '#E8E1FF',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
  },

  startButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 13,
    marginBottom: 28,
  },

  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },

  actionIcon: {
    width: 45,
    height: 45,
    backgroundColor: colors.primaryLight,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 13,
  },

  actionTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },

  actionDescription: {
    color: colors.secondaryText,
    fontSize: 11,
    marginTop: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  seeAll: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },

  meetingCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  meetingIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  meetingInfo: {
    flex: 1,
    marginLeft: 12,
  },

  meetingTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },

  meetingDate: {
    color: colors.secondaryText,
    fontSize: 11,
    marginTop: 5,
  },
});
