
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getMeetings, Meeting } from '../services/meetingService';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MeetingsStackParamList } from '../navigation/MeetingsStack';

export default function MeetingsScreen() {
  const { user } = useAuth();

const navigation =
  useNavigation<NativeStackNavigationProp<MeetingsStackParamList>>();  

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMeetings = useCallback(async () => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = await getMeetings(user.token);
      setMeetings(data);
    } catch (err) {
      console.error('Toplantılar yüklenemedi:', err);
      setError('Toplantılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useFocusEffect(
    useCallback(() => {
      loadMeetings();
    }, [loadMeetings])
  );

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (date?: string) => {
    if (!date) return 'Tarih bilgisi yok';

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return 'Tarih bilgisi yok';
    }

    return parsedDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} sn`;
    }

    return remainingSeconds === 0
      ? `${minutes} dk`
      : `${minutes} dk ${remainingSeconds} sn`;
  };

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
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.secondaryText}
        />

        <TextInput
          placeholder="Toplantı ara..."
          placeholderTextColor={colors.secondaryText}
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <Text style={styles.sectionTitle}>Son Toplantılar</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      ) : error ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={colors.secondaryText}
          />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : filteredMeetings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="folder-open-outline"
            size={45}
            color={colors.secondaryText}
          />

          <Text style={styles.emptyText}>
            {searchText
              ? 'Aradığın toplantı bulunamadı.'
              : 'Henüz kayıtlı toplantın yok.'}
          </Text>
        </View>
      ) : (
        filteredMeetings.map((meeting) => (
          <Pressable
            key={meeting.id}
            style={styles.meetingCard}
            onPress={() =>
              navigation.navigate('MeetingDetail', {
                meetingId: meeting.id,
              })
            }
          >
            <View style={styles.iconContainer}>
              <Ionicons
                name="briefcase-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.meetingInfo}>
              <Text style={styles.meetingTitle}>
                {meeting.title}
              </Text>

              <Text style={styles.meetingDate}>
                {formatDate(meeting.createdAt)}
              </Text>

              <Text style={styles.duration}>
                {formatDuration(meeting.durationSeconds)}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.secondaryText}
            />
          </Pressable>
        ))
      )}
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
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 35,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 12,
    textAlign: 'center',
  },
});
