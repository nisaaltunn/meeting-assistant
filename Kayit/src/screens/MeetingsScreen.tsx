
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const meetings = [
  {
    id: '1',
    title: 'Proje toplantısı',
    date: '19 Kasım 2026',
    duration: '35 dk',
    icon: 'briefcase-outline' as const,
  },
  {
    id: '2',
    title: 'Ders çalışma notları',
    date: '18 Kasım 2026',
    duration: '42 dk',
    icon: 'school-outline' as const,
  },
  {
    id: '3',
    title: 'Haftalık ekip toplantısı',
    date: '15 Kasım 2026',
    duration: '28 dk',
    icon: 'people-outline' as const,
  },
];

export default function MeetingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Toplantılarım</Text>
          <Text style={styles.subtitle}>
            Geçmiş kayıtlarını ve toplantı notlarını görüntüle.
          </Text>
        </View>

        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.secondaryText} />
          <TextInput
            placeholder="Toplantı ara..."
            placeholderTextColor={colors.secondaryText}
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionTitle}>Son Toplantılar</Text>

        {meetings.map((meeting) => (
          <View key={meeting.id} style={styles.meetingCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={meeting.icon} size={23} color={colors.primary} />
            </View>

            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle}>{meeting.title}</Text>
              <Text style={styles.meetingDate}>{meeting.date}</Text>
              <Text style={styles.duration}>{meeting.duration}</Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
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
  header: {
    padding: 22,
    paddingBottom: 15,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 7,
  },
  search: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 22,
    marginBottom: 12,
  },
  meetingCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingInfo: {
    flex: 1,
    marginLeft: 13,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  meetingDate: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 5,
  },
  duration: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
  },
});
