
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../theme/colors';

export default function RecordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ses Kaydı</Text>

        <Text style={styles.description}>
          Toplantını veya konuşmanı kaydet.
          Önemli detayları kaçırma.
        </Text>

        <View style={styles.recordCircle}>
          <Ionicons
            name="mic"
            size={65}
            color={colors.primary}
          />
        </View>

        <Text style={styles.timer}>00:00:00</Text>

        <Text style={styles.status}>
          Kayda başlamak için hazır
        </Text>

        <TouchableOpacity style={styles.recordButton}>
          <Ionicons name="mic" size={22} color="#FFFFFF" />
          <Text style={styles.buttonText}>
            Kaydı Başlat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons
            name="cloud-upload-outline"
            size={21}
            color={colors.primary}
          />
          <Text style={styles.uploadText}>
            Ses Dosyası Yükle
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
  },
  recordCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 55,
  },
  timer: {
    fontSize: 35,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 30,
  },
  status: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 8,
    marginBottom: 35,
  },
  recordButton: {
    backgroundColor: colors.primary,
    width: '100%',
    padding: 17,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  uploadButton: {
    width: '100%',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  uploadText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
