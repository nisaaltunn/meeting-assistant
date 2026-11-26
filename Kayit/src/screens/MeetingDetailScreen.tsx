import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getMeetingById, Meeting } from '../services/meetingService';
import {
  analyzeMeeting,
  MeetingAnalysis,
} from '../services/meetingAnalysisService';

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

interface TranscriptSegment {
  speaker: string;
  text: string;
}

type TranscriptBlock =
  | {
      id: string;
      type: 'plain';
      title: string;
      content: string;
    }
  | {
      id: string;
      type: 'diarized';
      title: string;
      segments: TranscriptSegment[];
    };

const SPEAKER_PALETTE = [
  { badgeBg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' }, // Mavi
  { badgeBg: '#DCFCE7', text: '#15803D', border: '#86EFAC' }, // Yeşil
  { badgeBg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' }, // Mor
  { badgeBg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' }, // Turuncu
  { badgeBg: '#FCE7F3', text: '#BE185D', border: '#F9A8D4' }, // Pembe
  { badgeBg: '#CCFBF1', text: '#0F766E', border: '#5EEAD4' }, // Turkuaz
];

// Tek metin içinde hem düz metin hem de JSON dizisi varsa bloklara ayırır
function parseTranscriptBlocks(rawTranscript?: string): TranscriptBlock[] {
  if (!rawTranscript || !rawTranscript.trim()) {
    return [];
  }

  const trimmed = rawTranscript.trim();

  // 1. Tamamı tek bir JSON dizisi ise
  try {
    const parsed = JSON.parse(trimmed);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0]?.speaker === 'string' &&
      typeof parsed[0]?.text === 'string'
    ) {
      return [
        {
          id: 'block-0',
          type: 'diarized',
          title: 'Konuşmacı Ayrıştırmalı Transkript',
          segments: parsed,
        },
      ];
    }
  } catch {
    // Karma metin olabilir, aşağıda parçalayarak kontrol et
  }

  // 2. Düz metin + JSON blokları bir aradaysa (ekran görüntüsündeki durum)
  const blocks: TranscriptBlock[] = [];
  const jsonArrayRegex = /\[\s*\{[\s\S]*?\}\s*\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockCounter = 0;

  while ((match = jsonArrayRegex.exec(trimmed)) !== null) {
    const beforeText = trimmed.slice(lastIndex, match.index).trim();
    if (beforeText) {
      blocks.push({
        id: `block-${blockCounter++}`,
        type: 'plain',
        title: `Bölüm ${blockCounter} (Düz Metin)`,
        content: beforeText,
      });
    }

    const candidateJson = match[0];
    try {
      const parsed = JSON.parse(candidateJson);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0]?.speaker === 'string' &&
        typeof parsed[0]?.text === 'string'
      ) {
        blocks.push({
          id: `block-${blockCounter++}`,
          type: 'diarized',
          title: `Bölüm ${blockCounter} (Konuşmacı Ayrıştırmalı)`,
          segments: parsed,
        });
      } else {
        blocks.push({
          id: `block-${blockCounter++}`,
          type: 'plain',
          title: `Bölüm ${blockCounter}`,
          content: candidateJson,
        });
      }
    } catch {
      blocks.push({
        id: `block-${blockCounter++}`,
        type: 'plain',
        title: `Bölüm ${blockCounter}`,
        content: candidateJson,
      });
    }

    lastIndex = match.index + candidateJson.length;
  }

  const remainingText = trimmed.slice(lastIndex).trim();
  if (remainingText) {
    blocks.push({
      id: `block-${blockCounter++}`,
      type: 'plain',
      title:
        blocks.length === 0
          ? 'Transkript Metni'
          : `Bölüm ${blockCounter} (Düz Metin)`,
      content: remainingText,
    });
  }

  return blocks;
}

export default function MeetingDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<DetailNavigationProp>();
  const { user } = useAuth();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);

  useEffect(() => {
    const loadMeeting = async () => {
      if (!user?.token) {
        setError('Oturum bilgisi bulunamadı.');
        setLoading(false);
        return;
      }

      try {
        const data: any = await getMeetingById(
          route.params.meetingId,
          user.token
        );
        setMeeting(data);

        // Backend analiz bilgisini meeting içinde döndürüyorsa doğrudan yükle
        if (data?.analysis) {
          setAnalysis(data.analysis);
        }
      } catch (err) {
        console.error('Toplantı detayı yüklenemedi:', err);
        setError('Toplantı detayları yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    loadMeeting();
  }, [route.params.meetingId, user?.token]);

  const transcriptBlocks = useMemo(
    () => parseTranscriptBlocks(meeting?.transcript),
    [meeting?.transcript]
  );

  // Tüm bloklardaki konuşmacılara tutarlı renk ataması
  const speakerColorMap = useMemo(() => {
    const map: Record<string, (typeof SPEAKER_PALETTE)[0]> = {};
    let colorIndex = 0;

    for (const block of transcriptBlocks) {
      if (block.type === 'diarized') {
        for (const seg of block.segments) {
          const key = seg.speaker.trim();
          if (!map[key]) {
            map[key] = SPEAKER_PALETTE[colorIndex % SPEAKER_PALETTE.length];
            colorIndex++;
          }
        }
      }
    }
    return map;
  }, [transcriptBlocks]);

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

  const copyText = async (text: string, label = 'Metin') => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Kopyalandı', `${label} panoya kopyalandı.`);
  };

  const formatBlockForCopy = (block: TranscriptBlock): string => {
    if (block.type === 'plain') {
      return block.content;
    }
    return block.segments
      .map((seg) => `${seg.speaker}: ${seg.text}`)
      .join('\n\n');
  };

  const copyAllTranscripts = async () => {
    if (transcriptBlocks.length === 0) return;
    const fullCleanText = transcriptBlocks
      .map((block) => formatBlockForCopy(block))
      .join('\n\n---\n\n');
    await copyText(fullCleanText, 'Tüm konuşma metni');
  };

  const handleAnalyzeMeeting = async () => {
    if (!meeting?.id || !user?.token) return;

    try {
      setIsAnalyzing(true);
      const result = await analyzeMeeting(meeting.id, user.token);
      setAnalysis(result.analysis);
      Alert.alert('Başarılı', 'Toplantı Gemini tarafından analiz edildi.');
    } catch (err) {
      console.error('Analiz hatası:', err);
      Alert.alert(
        'Analiz Hatası',
        err instanceof Error ? err.message : 'Toplantı analiz edilemedi.'
      );
    } finally {
      setIsAnalyzing(false);
    }
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

          <Text style={styles.title}>{meeting.title}</Text>

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

        {/* Analiz Butonu ve Kayıtlı Analiz Kartı */}
        {meeting.transcript && (
          <View style={styles.actionWrapper}>
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                { opacity: isAnalyzing ? 0.6 : 1 },
              ]}
              onPress={handleAnalyzeMeeting}
              disabled={isAnalyzing}
            >
              <Ionicons name="sparkles" size={20} color="#FFFFFF" />
              <Text style={styles.analyzeButtonText}>
                {isAnalyzing
                  ? 'Gemini analiz ediyor...'
                  : analysis
                    ? 'Toplantıyı Yeniden Analiz Et'
                    : 'Gemini ile Toplantıyı Analiz Et'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {analysis && (
          <View style={styles.analysisCard}>
            <View style={styles.transcriptHeader}>
              <View style={styles.titleWithIcon}>
                <Ionicons name="sparkles" size={20} color={colors.primary} />
                <Text style={styles.analysisMainTitle}>
                  Gemini Toplantı Analizi
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  copyText(
                    `Özet:\n${analysis.summary}\n\nKararlar:\n${analysis.decisions.join('\n')}`,
                    'Toplantı analizi'
                  )
                }
              >
                <Ionicons
                  name="copy-outline"
                  size={21}
                  color={colors.primary}
                />
              </Pressable>
            </View>

            <Text style={styles.analysisSectionTitle}>Toplantı Özeti</Text>
            <Text style={styles.analysisText}>{analysis.summary}</Text>

            <Text style={styles.analysisSectionTitle}>Alınan Kararlar</Text>
            {analysis.decisions.length > 0 ? (
              analysis.decisions.map((item, idx) => (
                <Text key={idx} style={styles.analysisText}>
                  {idx + 1}. {item}
                </Text>
              ))
            ) : (
              <Text style={styles.analysisText}>Henüz karar bulunamadı.</Text>
            )}

            <Text style={styles.analysisSectionTitle}>Yapılacak Görevler</Text>
            {analysis.tasks.length > 0 ? (
              analysis.tasks.map((item, idx) => (
                <View key={idx} style={styles.taskBox}>
                  <Text style={styles.analysisText}>
                    {idx + 1}. {item.description}
                  </Text>
                  <Text style={styles.analysisSubText}>
                    Sorumlu: {item.responsiblePerson || 'Belirtilmedi'} | Son tarih: {item.deadline || 'Belirtilmedi'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.analysisText}>Henüz görev bulunamadı.</Text>
            )}

            <Text style={styles.analysisSectionTitle}>Katılımcılar</Text>
            {analysis.participants.length > 0 ? (
              analysis.participants.map((item, idx) => (
                <Text key={idx} style={styles.analysisText}>
                  {item.speakerLabel}: {item.name || 'İsim belirtilmedi'}
                </Text>
              ))
            ) : (
              <Text style={styles.analysisText}>
                Katılımcı bilgisi bulunamadı.
              </Text>
            )}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Toplantı Transkripti</Text>

          {transcriptBlocks.length > 1 && (
            <Pressable
              style={styles.copyAllChip}
              onPress={copyAllTranscripts}
            >
              <Ionicons
                name="copy-outline"
                size={15}
                color={colors.primary}
              />
              <Text style={styles.copyAllText}>Tümünü Kopyala</Text>
            </Pressable>
          )}
        </View>

        {transcriptBlocks.length === 0 ? (
          <View style={styles.transcriptCard}>
            <Text style={styles.transcript}>
              Bu toplantı için transkript bulunmuyor.
            </Text>
          </View>
        ) : (
          transcriptBlocks.map((block) => (
            <View key={block.id} style={styles.transcriptCard}>
              <View style={styles.transcriptHeader}>
                <Text style={styles.transcriptLabel}>{block.title}</Text>

                <Pressable
                  onPress={() =>
                    copyText(formatBlockForCopy(block), block.title)
                  }
                >
                  <Ionicons
                    name="copy-outline"
                    size={21}
                    color={colors.primary}
                  />
                </Pressable>
              </View>

              {block.type === 'plain' ? (
                <Text selectable style={styles.transcript}>
                  {block.content}
                </Text>
              ) : (
                <View style={styles.segmentsContainer}>
                  {block.segments.map((segment, index) => {
                    const speakerTheme =
                      speakerColorMap[segment.speaker.trim()] ||
                      SPEAKER_PALETTE[0];

                    return (
                      <View
                        key={index}
                        style={[
                          styles.segmentBubble,
                          { borderLeftColor: speakerTheme.text },
                        ]}
                      >
                        <View
                          style={[
                            styles.speakerBadge,
                            {
                              backgroundColor: speakerTheme.badgeBg,
                              borderColor: speakerTheme.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.speakerName,
                              { color: speakerTheme.text },
                            ]}
                          >
                            {segment.speaker}
                          </Text>
                        </View>

                        <Text selectable style={styles.transcript}>
                          {segment.text}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
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
  actionWrapper: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  analysisCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 20,
    borderRadius: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisMainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  analysisSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 14,
    marginBottom: 6,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 4,
  },
  taskBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  analysisSubText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  copyAllChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  copyAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  transcriptCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  transcript: {
    fontSize: 15,
    lineHeight: 24,
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
  segmentsContainer: {
    gap: 12,
  },
  segmentBubble: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
  },
  speakerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  speakerName: {
    fontSize: 12,
    fontWeight: 'bold',
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