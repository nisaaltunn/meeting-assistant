
import React, { useEffect, useRef, useState } from 'react';
import { API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';


import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File } from 'expo-file-system';
import { fetch } from 'expo/fetch';
import * as DocumentPicker from 'expo-document-picker';

import {
  useAudioRecorder,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
} from 'expo-audio';

import colors from '../theme/colors';

export default function RecordScreen() {
  const { user } = useAuth();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [audioName, setAudioName] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');

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
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: false,
      });
  
      if (result.canceled) {
        return;
      }
  
      const selectedFile = result.assets[0];
  
      setAudioUri(selectedFile.uri);
      setAudioName(selectedFile.name);
      setTranscript('');
      setRecordingTime(0);
  
      Alert.alert(
        'Dosya seçildi',
        `${selectedFile.name} başarıyla seçildi.`
      );
  
    } catch (error) {
      console.error('Dosya seçme hatası:', error);
  
      Alert.alert(
        'Hata',
        'Ses dosyası seçilemedi.'
      );
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

  try {
    setIsTranscribing(true);
    setTranscript('');

    // Telefonun yerel ses dosyasını File nesnesine dönüştür.
    const audioFile = new File(audioUri);

    // Dosyayı multipart/form-data olarak hazırla.
    const formData = new FormData();
    formData.append(
      'file',
      audioFile,
      audioName || 'meeting-recording.m4a'
    );
    
    console.log('Token mevcut mu:', !!user?.token);
    const response = await fetch(
      `${API_URL}/api/ai/transcribe`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      }
    );
    const responseText = await response.text();

    let result: any = {};
    
    if (responseText) {
      try {
        result = JSON.parse(responseText);
      } catch {
        result = { message: responseText };
      }
    }
    
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${
          result.message || 'Sunucudan hata yanıtı alındı.'
        }`
      );
    }
    
    if (!result.transcript) {
      throw new Error('Backend boş bir transkripsiyon yanıtı döndürdü.');
    }
    
    setTranscript(result.transcript);
    if (!response.ok) {
      throw new Error(
        result.message || 'Ses metne dönüştürülemedi.'
      );
    }

    if (!result.transcript) {
      throw new Error('Gemini boş bir yanıt döndürdü.');
    }

    setTranscript(result.transcript);

  } catch (error) {
    console.error('Transkripsiyon hatası:', error);

    Alert.alert(
      'Dönüştürme hatası',
      error instanceof Error
        ? error.message
        : 'Bir hata oluştu.'
    );
  } finally {
    setIsTranscribing(false);
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
    <View style={styles.transcriptHeader}>
      <Ionicons
        name="document-text"
        size={22}
        color={colors.primary}
      />

      <Text style={styles.transcriptTitle}>
        Konuşma Metni
      </Text>
    </View>

    <Text style={styles.transcriptText}>
      {transcript}
    </Text>
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
    marginBottom: 14,
  },
  
  transcriptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  
  transcriptText: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.text,
  },
});
