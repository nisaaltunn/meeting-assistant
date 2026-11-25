
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getMeetingById, Meeting } from '../services/meetingService';

type MeetingsStackParamList = {
  MeetingsList: undefined;
  MeetingDetail: { meetingId: number };
};

type DetailRouteProp = RouteProp<
  MeetingsStackParamList,
  'MeetingDetail'
>;

type DetailNavigationProp = NativeStackNavigationProp<
  MeetingsStackParamList,
  'MeetingDetail'
>;

export default function MeetingDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavigationProp>();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMeeting = async () => {
      if (!user?.token) {
        setError('Oturum bilgisi bulunamadı.');
        setLoading(false);
        return;
      }

      try {
        const data = await getMeetingById(
          route.params.meetingId,
          user.token
        );
        setMeeting(data);
      } catch (err) {
        console.error('Toplantı detayı yüklenemedi:', err);
        setError('Toplantı detayları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [route.params.meetingId, user?.token]);

  const formatDate = (date?: string) => {
    if (!date) return 'Tarih bilgisi yok';

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return 'Tarih bilgisi yok';
    }

    return parsedDate.toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return remainingSeconds === 0
      ? `${minutes} dk`
      : `${minutes} dk ${remainingSeconds} sn`;
  };

  const copyText = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Kopyalandı', 'Metin panoya kopyalandı.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />
      </SafeAreaView>
    );
  }

  if (error || !meeting) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.errorText}>
          {error || 'Toplantı bulunamadı.'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Toplantı Detayı</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="briefcase-outline"
              size={30}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>
            {meeting.title}
          </Text>

          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={17}
              color={colors.secondaryText}
            />
            <Text selectable style={styles.metaText}>
              {formatDate(meeting.createdAt)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons
              name="time-outline"
              size={17}
              color={colors.secondaryText}
            />
            <Text selectable style={styles.metaText}>
              {formatDuration(meeting.durationSeconds)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Toplantı Transkripti</Text>

        <View style={styles.transcriptCard}>
          <View style={styles.transcriptHeader}>
            <Text style={styles.transcriptLabel}>
              Transkript Metni
            </Text>

            <Pressable
              onPress={() => copyText(meeting.transcript || '')}
              disabled={!meeting.transcript}
            >
              <Ionicons
                name="copy-outline"
                size={21}
                color={colors.primary}
              />
            </Pressable>
          </View>

          <Text style={styles.transcript}>
            {meeting.transcript || 'Bu toplantı için transkript bulunmuyor.'}
          </Text>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 15,
  },
  infoCard: {
    marginHorizontal: 20,
    padding: 22,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  iconContainer: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 9,
  },
  metaText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 22,
    marginTop: 25,
    marginBottom: 12,
  },
  transcriptCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 25,
    padding: 20,
    borderRadius: 16,
  },
  transcript: {
    fontSize: 15,
    lineHeight: 25,
    color: colors.text,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  transcriptLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.secondaryText,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 30,
  },
});
