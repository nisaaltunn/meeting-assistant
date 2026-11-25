
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
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>MERHABA 👋</Text>
            <Text style={styles.headerTitle}>Konuştuklarımız</Text>
            <Text style={styles.headerSubtitle}>
              Konuşmaların artık daha anlamlı.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Profil')}
          >
            <Ionicons
              name="person-outline"
              size={23}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.aiBadge}>
              <Ionicons
                name="sparkles"
                size={13}
                color="#FFFFFF"
              />
              <Text style={styles.aiBadgeText}>
                AI DESTEKLİ ASİSTAN
              </Text>
            </View>

            <View style={styles.heroMicIcon}>
              <Ionicons
                name="mic"
                size={25}
                color="#FFFFFF"
              />
            </View>
          </View>

          <Text style={styles.heroTitle}>
            Hiçbir önemli detayı kaçırma.
          </Text>

          <Text style={styles.heroDescription}>
            Toplantılarını kaydet, konuşmalarını
            yazıya dönüştür ve yapay zekâ ile
            önemli noktaları keşfet.
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Kayıt')}
          >
            <Ionicons
              name="mic-outline"
              size={21}
              color={colors.primary}
            />

            <Text style={styles.startButtonText}>
              Yeni kayıt başlat
            </Text>

            <Ionicons
              name="arrow-forward"
              size={19}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* STATISTICS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Genel Bakış
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>
              Toplam toplantı
            </Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons
                name="time-outline"
                size={21}
                color={colors.primary}
              />
            </View>

            <Text style={styles.statValue}>4 sa 20 dk</Text>
            <Text style={styles.statLabel}>
              Toplam kayıt süresi
            </Text>
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>
          Hızlı İşlemler
        </Text>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Kayıt')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="mic-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionTitle}>
              Ses Kaydet
            </Text>

            <Text style={styles.actionDescription}>
              Yeni bir kayıt oluştur
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('Kayıt')}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="cloud-upload-outline"
                size={24}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionTitle}>
              Dosya Yükle
            </Text>

            <Text style={styles.actionDescription}>
              Ses dosyanı içe aktar
            </Text>
          </TouchableOpacity>
        </View>

        {/* MEETINGS BUTTON */}
        <TouchableOpacity
          style={styles.meetingsCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Toplantılar')}
        >
          <View style={styles.meetingsContent}>
            <View style={styles.meetingsIcon}>
              <Ionicons
                name="folder-open"
                size={27}
                color={colors.primary}
              />
            </View>

            <View style={styles.meetingsInfo}>
              <Text style={styles.meetingsTitle}>
                Toplantılarım
              </Text>

              <Text style={styles.meetingsDescription}>
                Tüm kayıtlarını ve toplantı notlarını
                tek bir yerde görüntüle.
              </Text>
            </View>
          </View>

          <View style={styles.meetingsDivider} />

          <View style={styles.meetingsFooter}>
            <Text style={styles.meetingsLink}>
              Toplantılarımı görüntüle
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Ionicons
            name="sparkles-outline"
            size={15}
            color={colors.primary}
          />
          <Text style={styles.footerText}>
            Konuşmalarından daha fazlasını keşfet.
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

  scrollContent: {
    padding: 20,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  greeting: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 5,
  },

  headerSubtitle: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 5,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroCard: {
    backgroundColor: colors.primary,
    padding: 22,
    borderRadius: 24,
    marginBottom: 28,
    overflow: 'hidden',
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.17)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },

  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.6,
  },

  heroMicIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.17)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroTitle: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 19,
    lineHeight: 34,
  },

  heroDescription: {
    color: '#EAE5FF',
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
  },

  startButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
  },

  startButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
    marginLeft: 10,
  },

  sectionHeader: {
    marginBottom: 14,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 14,
  },

  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 27,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statIcon: {
    width: 39,
    height: 39,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  statValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: 'bold',
  },

  statLabel: {
    color: colors.secondaryText,
    fontSize: 11,
    marginTop: 5,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },

  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },

  actionIcon: {
    width: 43,
    height: 43,
    backgroundColor: colors.primaryLight,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  actionTitle: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 13,
  },

  actionDescription: {
    color: colors.secondaryText,
    fontSize: 10,
    marginTop: 5,
  },

  // TOPLANTILAR KARTI
  meetingsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  meetingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  meetingsIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  meetingsInfo: {
    flex: 1,
    marginLeft: 14,
  },

  meetingsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },

  meetingsDescription: {
    color: colors.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  meetingsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 17,
  },

  meetingsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
  },

  meetingsLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 7,
  },

  footerText: {
    color: colors.secondaryText,
    fontSize: 11,
  },
});
