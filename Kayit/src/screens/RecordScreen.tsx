import React, { useEffect, useMemo, useRef, useState } from 'react';
import { API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { saveMeeting } from '../services/meetingService';

import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import {
  analyzeMeeting,
  MeetingAnalysis,
} from '../services/meetingAnalysisService';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';

import colors from '../theme/colors';

interface TranscriptSegment {
  speaker: string;
  text: string;
}

const SPEAKER_PALETTE = [
  { badgeBg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' }, // Mavi
  { badgeBg: '#DCFCE7', text: '#15803D', border: '#86EFAC' }, // Yeşil
  { badgeBg: '#F3E8FF', text: '#7E22CE', border: '#D8B4FE' }, // Mor
  { badgeBg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' }, // Turuncu
  { badgeBg: '#FCE7F3', text: '#BE185D', border: '#F9A8D4' }, // Pembe
  { badgeBg: '#CCFBF1', text: '#0F766E', border: '#5EEAD4' }, // Turkuaz
];

export default function RecordScreen() {
  const [savedMeetingId, setSavedMeetingId] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [audioName, setAudioName] = useState('');
  const [audioMimeType, setAudioMimeType] = useState('audio/m4a');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');

  // JSON formatındaki transkripti konuşmacı segmentlerine ayır
  const transcriptSegments = useMemo<TranscriptSegment[] | null>(() => {
    if (!transcript.trim()) return null;

    try {
      const parsed = JSON.parse(transcript);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0]?.speaker === 'string' &&
        typeof parsed[0]?.text === 'string'
      ) {
        return parsed;
      }
    } catch {
      // Düz metin formatındaysa null dönerek fallback görünümünü kullan
    }
    return null;
  }, [transcript]);

  // Her benzersiz konuşmacıya tutarlı bir renk eşleştir
  const speakerColorMap = useMemo(() => {
    const map: Record<string, (typeof SPEAKER_PALETTE)[0]> = {};
    if (!transcriptSegments) return map;

    let colorIndex = 0;
    for (const seg of transcriptSegments) {
      const key = seg.speaker.trim();
      if (!map[key]) {
        map[key] = SPEAKER_PALETTE[colorIndex % SPEAKER_PALETTE.length];
        colorIndex++;
      }
    }
    return map;
  }, [transcriptSegments]);

  // Kayıt süresini hesapla
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );

        setRecordingTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  // Süreyi saat:dakika:saniye formatına dönüştür
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [hours, minutes, remainingSeconds]
      .map((value) => String(value).padStart(2, '0'))
      .join(':');
  };

  const pickAudioFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: false,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const selectedFile = result.assets[0];
      const fileNameLower = selectedFile.name.toLowerCase();

      const isAudio =
        selectedFile.mimeType?.startsWith('audio/') ||
        fileNameLower.endsWith('.wav') ||
        fileNameLower.endsWith('.m4a') ||
        fileNameLower.endsWith('.mp3') ||
        fileNameLower.endsWith('.aac') ||
        fileNameLower.endsWith('.ogg');

      if (!isAudio) {
        Alert.alert(
          'Geçersiz dosya',
          'Lütfen .wav, .m4a veya .mp3 formatında bir ses dosyası seçin.'
        );
        return;
      }

      setAudioUri(selectedFile.uri);
      setAudioName(selectedFile.name);
      setAudioMimeType(
        selectedFile.mimeType && selectedFile.mimeType.startsWith('audio/')
          ? selectedFile.mimeType
          : fileNameLower.endsWith('.wav')
            ? 'audio/wav'
            : 'audio/mp4'
      );

      setTranscript('');
      setRecordingTime(0);
      setSavedMeetingId(null);
      setAnalysis(null);

      Alert.alert(
        'Dosya seçildi',
        `${selectedFile.name} başarıyla seçildi.`
      );
    } catch (error) {
      console.error('Dosya seçme hatası:', error);
      Alert.alert('Hata', 'Ses dosyası seçilemedi.');
    }
  };

  // Kaydı başlat
  const startRecording = async () => {
    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Mikrofon izni gerekli',
          'Ses kaydı yapabilmek için mikrofon izni vermelisin.'
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();

      startTimeRef.current = Date.now();

      setRecordingTime(0);
      setAudioUri(null);
      setTranscript('');
      setSavedMeetingId(null);
      setAnalysis(null);
      setIsRecording(true);
    } catch (error) {
      console.error('Kayıt başlatma hatası:', error);

      Alert.alert(
        'Hata',
        'Ses kaydı başlatılamadı. Tekrar deneyebilirsin.'
      );
    }
  };

  // Kaydı durdur
  const stopRecording = async () => {
    try {
      await audioRecorder.stop();

      setIsRecording(false);
      startTimeRef.current = null;

      const uri = audioRecorder.uri;

      if (uri) {
        setAudioUri(uri);
        setAudioName('Ses kaydı');
        setAudioMimeType('audio/m4a');

        Alert.alert(
          'Kayıt tamamlandı',
          'Ses kaydın başarıyla kaydedildi.'
        );

        console.log('Ses dosyası:', uri);
      }
    } catch (error) {
      console.error('Kayıt durdurma hatası:', error);

      Alert.alert(
        'Hata',
        'Ses kaydı durdurulurken bir sorun oluştu.'
      );
    }
  };

  const transcribeAudio = async () => {
    if (!audioUri) {
      Alert.alert('Uyarı', 'Önce bir ses kaydı yapmalısın.');
      return;
    }
    if (!user?.token) {
      Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
      return;
    }

    try {
      setIsTranscribing(true);
      setTranscript('');

      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        name: audioName || 'meeting-recording.wav',
        type: audioMimeType,
      } as any);

      const responseData: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_URL}/api/ai/transcribe`);
        xhr.setRequestHeader('Authorization', `Bearer ${user.token}`);
        xhr.timeout = 60000;

        xhr.onload = () => {
          let parsed: any = {};
          if (xhr.responseText) {
            try {
              parsed = JSON.parse(xhr.responseText);
            } catch {
              parsed = { message: xhr.responseText };
            }
          }

          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(parsed);
          } else {
            reject(
              new Error(
                `HTTP ${xhr.status}: ${
                  parsed.message || 'Sunucudan hata yanıtı alındı.'
                }`
              )
            );
          }
        };

        xhr.onerror = () => {
          reject(new Error('Sunucuya bağlanırken ağ hatası oluştu.'));
        };

        xhr.ontimeout = () => {
          reject(new Error('İstek zaman aşımına uğradı.'));
        };

        xhr.send(formData);
      });

      if (!responseData.transcript) {
        throw new Error('Backend boş bir transkripsiyon yanıtı döndürdü.');
      }

      setTranscript(responseData.transcript);
    } catch (error) {
      console.error('Transkripsiyon hatası:', error);

      Alert.alert(
        'Dönüştürme hatası',
        error instanceof Error ? error.message : 'Bir hata oluştu.'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleAnalyzeMeeting = async () => {
    if (!savedMeetingId) {
      Alert.alert('Uyarı', 'Önce toplantıyı kaydetmelisin.');
      return;
    }

    if (!user?.token) {
      Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysis(null);

      const result = await analyzeMeeting(
        savedMeetingId,
        user.token
      );

      setAnalysis(result.analysis);

      Alert.alert(
        'Başarılı',
        'Toplantı Gemini tarafından analiz edildi.'
      );
    } catch (error) {
      console.error('Toplantı analiz hatası:', error);

      Alert.alert(
        'Analiz Hatası',
        error instanceof Error
          ? error.message
          : 'Toplantı analiz edilemedi.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeeting = async () => {
    if (!transcript.trim()) {
      Alert.alert('Uyarı', 'Önce ses kaydını metne dönüştürmelisin.');
      return;
    }

    if (!meetingTitle.trim()) {
      Alert.alert('Uyarı', 'Lütfen toplantı başlığını gir.');
      return;
    }

    if (!user?.token) {
      Alert.alert('Hata', 'Oturum bilgisi bulunamadı.');
      return;
    }

    try {
      setIsSaving(true);

      const savedMeeting: any = await saveMeeting(
        {
          title: meetingTitle.trim(),
          transcript,
          durationSeconds: recordingTime,
        },
        user.token
      );

      const newMeetingId =
        savedMeeting?.id ??
        savedMeeting?.meetingId ??
        savedMeeting?.meeting?.id ??
        null;

      if (!newMeetingId) {
        console.error('Sunucu yanıtından toplantı ID okunamadı:', savedMeeting);
        Alert.alert('Hata', 'Toplantı kaydedildi ancak ID bilgisi alınamadı.');
        return;
      }

      setSavedMeetingId(newMeetingId);
      setAnalysis(null);

      Alert.alert('Başarılı', 'Toplantın başarıyla kaydedildi.');
      setMeetingTitle('');
    } catch (error) {
      console.error('Toplantı kaydetme hatası:', error);

      Alert.alert(
        'Hata',
        error instanceof Error ? error.message : 'Toplantı kaydedilemedi.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Ses Kaydı</Text>

          <Text style={styles.description}>
            Toplantılarını kaydet, önemli detayları
            kolayca sakla.
          </Text>
        </View>

        <View style={styles.recordCard}>
          <View
            style={[
              styles.recordCircle,
              isRecording && styles.recordCircleActive,
            ]}
          >
            <Ionicons
              name="mic"
              size={58}
              color={colors.primary}
            />
          </View>

          <Text style={styles.timer}>
            {formatTime(recordingTime)}
          </Text>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                isRecording && styles.statusDotActive,
              ]}
            />

            <Text style={styles.status}>
              {isRecording
                ? 'Ses kaydediliyor...'
                : audioUri
                  ? 'Kayıt tamamlandı'
                  : 'Kayda başlamak için hazır'}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.stopButton,
            ]}
            activeOpacity={0.8}
            onPress={handleRecording}
          >
            <Ionicons
              name={isRecording ? 'stop-circle' : 'radio-button-on'}
              size={23}
              color="#FFFFFF"
            />

            <Text style={styles.buttonText}>
              {isRecording ? 'Kaydı Durdur' : 'Kaydı Başlat'}
            </Text>
          </TouchableOpacity>
        </View>

        {audioUri && (
          <View style={styles.savedCard}>
            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#22C55E"
            />

            <View style={styles.savedInfo}>
              <Text style={styles.savedTitle}>
                Ses kaydın hazır
              </Text>

              <Text style={styles.savedDescription}>
                {audioName}
              </Text>
            </View>
          </View>
        )}

        {audioUri && (
          <TouchableOpacity
            style={[
              styles.recordButton,
              {
                marginTop: 15,
                opacity: isTranscribing ? 0.6 : 1,
              },
            ]}
            activeOpacity={0.8}
            onPress={transcribeAudio}
            disabled={isTranscribing}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text style={styles.buttonText}>
              {isTranscribing
                ? 'Konuşma metne çevriliyor...'
                : 'Gemini ile Metne Dönüştür'}
            </Text>
          </TouchableOpacity>
        )}

        {transcript !== '' && (
          <View style={styles.transcriptCard}>
            <View style={styles.saveMeetingCard}>
              <Text style={styles.saveMeetingTitle}>
                Toplantıyı Kaydet
              </Text>

              <Text style={styles.saveMeetingDescription}>
                Toplantına bir başlık vererek kayıtlarına ekleyebilirsin.
              </Text>

              <TextInput
                style={styles.titleInput}
                placeholder="Örn. Haftalık proje toplantısı"
                placeholderTextColor={colors.secondaryText}
                value={meetingTitle}
                onChangeText={setMeetingTitle}
              />

              <TouchableOpacity
                style={[
                  styles.recordButton,
                  {
                    marginTop: 12,
                    opacity: isSaving ? 0.6 : 1,
                  },
                ]}
                onPress={handleSaveMeeting}
                disabled={isSaving}
              >
                <Ionicons
                  name="save-outline"
                  size={21}
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  {isSaving ? 'Kaydediliyor...' : 'Toplantıyı Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>

            {savedMeetingId !== null && (
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  {
                    marginTop: 12,
                    opacity: isAnalyzing ? 0.6 : 1,
                  },
                ]}
                onPress={handleAnalyzeMeeting}
                disabled={isAnalyzing}
              >
                <Ionicons
                  name="sparkles"
                  size={21}
                  color="#FFFFFF"
                />

                <Text style={styles.buttonText}>
                  {isAnalyzing
                    ? 'Gemini analiz ediyor...'
                    : 'Gemini ile Toplantıyı Analiz Et'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.transcriptHeader}>
              <Ionicons
                name="people"
                size={22}
                color={colors.primary}
              />

              <Text style={styles.transcriptTitle}>
                Konuşma Metni
              </Text>
            </View>

            {transcriptSegments ? (
              <View style={styles.segmentsContainer}>
                {transcriptSegments.map((segment, index) => {
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

                      <Text style={styles.transcriptText}>
                        {segment.text}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.transcriptText}>
                {transcript}
              </Text>
            )}
          </View>
        )}

        {analysis && (
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Ionicons
                name="sparkles"
                size={23}
                color={colors.primary}
              />
              <Text style={styles.analysisTitle}>
                Gemini Toplantı Analizi
              </Text>
            </View>

            <Text style={styles.analysisSectionTitle}>
              Toplantı Özeti
            </Text>
            <Text style={styles.analysisText}>
              {analysis.summary}
            </Text>

            <Text style={styles.analysisSectionTitle}>
              Alınan Kararlar
            </Text>

            {analysis.decisions.length > 0 ? (
              analysis.decisions.map((item, index) => (
                <Text key={index} style={styles.analysisText}>
                  {index + 1}. {item}
                </Text>
              ))
            ) : (
              <Text style={styles.analysisText}>
                Henüz karar bulunamadı.
              </Text>
            )}

            <Text style={styles.analysisSectionTitle}>
              Yapılacak Görevler
            </Text>

            {analysis.tasks.length > 0 ? (
              analysis.tasks.map((item, index) => (
                <View key={index} style={styles.analysisItem}>
                  <Text style={styles.analysisText}>
                    {index + 1}. {item.description}
                  </Text>
                  <Text style={styles.analysisSubText}>
                    Sorumlu: {item.responsiblePerson || 'Belirtilmedi'}
                  </Text>
                  <Text style={styles.analysisSubText}>
                    Son tarih: {item.deadline || 'Belirtilmedi'}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.analysisText}>
                Henüz görev bulunamadı.
              </Text>
            )}

            <Text style={styles.analysisSectionTitle}>
              Katılımcılar
            </Text>

            {analysis.participants.length > 0 ? (
              analysis.participants.map((item, index) => (
                <Text key={index} style={styles.analysisText}>
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

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>
            Alternatif Yöntem
          </Text>

          <TouchableOpacity
            style={styles.uploadButton}
            activeOpacity={0.8}
            onPress={pickAudioFile}
          >
            <View style={styles.uploadIcon}>
              <Ionicons
                name="cloud-upload-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <View style={styles.uploadInfo}>
              <Text style={styles.uploadTitle}>
                Ses Dosyası Yükle
              </Text>

              <Text style={styles.uploadDescription}>
                Cihazından bir ses dosyası seç
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={21}
              color={colors.secondaryText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color={colors.primary}
          />

          <Text style={styles.infoText}>
            Kaydını tamamladıktan sonra konuşma
            içeriğini ve toplantı özetini
            görüntüleyebileceksin.
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
  content: {
    padding: 22,
    paddingBottom: 35,
  },
  header: {
    marginTop: 15,
    marginBottom: 28,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 22,
    marginTop: 8,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordCircle: {
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  recordCircleActive: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  timer: {
    fontSize: 38,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 25,
    fontVariant: ['tabular-nums'],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 28,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#EF4444',
  },
  status: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  recordButton: {
    width: '100%',
    backgroundColor: colors.primary,
    padding: 17,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedCard: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedInfo: {
    flex: 1,
  },
  savedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  savedDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  uploadSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 13,
  },
  uploadButton: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadInfo: {
    flex: 1,
    marginLeft: 13,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  uploadDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: 15,
    borderRadius: 15,
    marginTop: 22,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 19,
  },
  transcriptCard: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  transcriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 18,
    marginBottom: 14,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
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
  transcriptText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  saveMeetingCard: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveMeetingTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  saveMeetingDescription: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 7,
    marginBottom: 15,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  analysisCard: {
    backgroundColor: colors.surface,
    borderRadius: 17,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 18,
  },
  analysisTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  analysisSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    marginBottom: 6,
  },
  analysisItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  analysisSubText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 5,
  },
});