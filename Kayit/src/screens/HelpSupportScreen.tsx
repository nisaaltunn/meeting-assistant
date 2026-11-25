
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const faqs = [
  {
    question: 'Nasıl toplantı kaydı oluşturabilirim?',
    answer:
      'Ana ekrandaki kayıt butonuna basarak toplantı kaydını başlatabilirsiniz. Toplantı bittiğinde kaydı durdurup kaydedebilirsiniz.',
  },
  {
    question: 'Toplantı kayıtlarımı nerede görebilirim?',
    answer:
      'Toplantılar sekmesinden daha önce kaydettiğiniz toplantıları görüntüleyebilir ve detaylarına ulaşabilirsiniz.',
  },
  {
    question: 'Toplantı analizini nasıl kullanabilirim?',
    answer:
      'Kaydedilen veya metne dönüştürülen toplantılarınız için analiz özelliğini kullanarak özet ve önemli noktaları görüntüleyebilirsiniz.',
  },
  {
    question: 'Şifremi nasıl değiştirebilirim?',
    answer:
      'Profil > Gizlilik ve Güvenlik bölümüne girerek mevcut şifrenizi ve yeni şifrenizi yazıp şifrenizi değiştirebilirsiniz.',
  },
  {
    question: 'Hesap bilgilerimi değiştirebilir miyim?',
    answer:
      'Profil > Hesap Bilgileri bölümünden adınızı ve soyadınızı güncelleyebilirsiniz.',
  },
];

export default function HelpSupportScreen({ navigation }: any) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleEmail = async () => {
    const email = 'destek@kayitapp.com';
    const url = `mailto:${email}?subject=Kayit%20Uygulamasi%20Destek`;

    try {
      await Linking.openURL(url);
    } catch {
      // Cihazda e-posta uygulaması bulunamazsa işlem yapılmaz.
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={styles.backText}>Geri</Text>
        </Pressable>

        <View style={styles.iconContainer}>
          <Ionicons
            name="help-circle-outline"
            size={38}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>Yardım ve Destek</Text>
        <Text style={styles.description}>
          Kayit uygulamasını kullanırken ihtiyaç duyabileceğiniz bilgiler
          burada.
        </Text>

        <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>

        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Pressable
              style={styles.questionRow}
              onPress={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
            >
              <Text style={styles.question}>{faq.question}</Text>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.primary}
              />
            </Pressable>

            {expandedIndex === index && (
              <Text style={styles.answer}>{faq.answer}</Text>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Bizimle İletişime Geçin</Text>

        <Pressable style={styles.contactCard} onPress={handleEmail}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail-outline" size={23} color={colors.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>E-posta Adresimiz</Text>
            <Text style={styles.contactEmail}>destek@kayitapp.com</Text>
          </View>
          <Ionicons
            name="open-outline"
            size={20}
            color={colors.secondaryText}
          />
        </Pressable>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Kayit Hakkında</Text>
          <Text style={styles.aboutText}>
            Kayit, toplantılarınızı kaydetmenize, metne dönüştürmenize ve
            yapay zekâ destekli analizlerle daha verimli hale getirmenize
            yardımcı olur.
          </Text>
          <Text style={styles.version}>Uygulama Sürümü: 1.0.0</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backText: {
    color: colors.text,
    fontSize: 16,
    marginLeft: 8,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 21,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    marginTop: 10,
  },
  faqCard: {
    backgroundColor: colors.surface,
    borderRadius: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginRight: 10,
  },
  answer: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.secondaryText,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 13,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 13,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  contactEmail: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: 13,
    padding: 17,
    marginTop: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 9,
  },
  aboutText: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 21,
  },
  version: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 14,
  },
});
