import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native'

const FAQS = [
  {
    category: 'About Tawazon',
    items: [
      {
        question: 'What is Tawazon for?',
        answer:
          'Tawazon is a daily wellness companion for young people navigating emotional difficulties, including struggles related to self-worth, body image, eating patterns, and stress. It is designed for high-risk users who need gentle, consistent support — not a quick fix.',
      },
      {
        question: 'Is Tawazon a medical or clinical tool?',
        answer:
          'No. Tawazon is not a medical tool and does not diagnose or treat eating disorders or any other condition. It is a supportive companion designed to sit alongside professional care. If you are working with a therapist, dietitian, or doctor, Tawazon complements that — it does not replace it.',
      },
      {
        question: 'Why was I asked to take a quiz when I signed up?',
        answer:
          'The quiz helps Tawazon understand where you are right now — emotionally and in terms of your wellbeing. It is not a diagnostic test. It simply helps personalise your experience so the tools and support you see are most relevant to you.',
      },
    ],
  },
  {
    category: 'Privacy & Safety',
    items: [
      {
        question: 'Can anyone see my journal?',
        answer:
          'No. Your journal is completely private. No parent, guardian, or anyone else can read your journal entries — not even Tawazon staff. Only you can see what you write.',
      },
      {
        question: 'What does my parent or guardian see?',
        answer:
          'If you have linked a parent account, they can only see summarised weekly trends — mood, stress, and sleep averages. They cannot see your journal content, check-in notes, or anything personal. This is by design, to protect your honesty in the app.',
      },
      {
        question: 'Are my check-in notes private?',
        answer:
          'Yes. Any notes you write during a daily check-in are private to you. Parents only see numerical trends — never your words.',
      },
    ],
  },
  {
    category: 'Using the App',
    items: [
      {
        question: 'What is the Balance Tree?',
        answer:
          'Your Balance Tree is a visual reflection of your consistency. It grows as you complete daily check-ins. The more regularly you show up for yourself, the more it blooms — from a Seed all the way to Thriving. It is not a measure of how "well" you are, just how consistently you are engaging with your own wellbeing.',
      },
      {
        question: 'What is a daily check-in?',
        answer:
          'A daily check-in is a short moment — under a minute — where you log how you are feeling, your stress level, and your sleep quality. It helps your Balance Tree grow and gives Tawazon a picture of how you are doing over time.',
      },
      {
        question: 'What are Balance Boosters?',
        answer:
          'Balance Boosters are personal activities that help you feel more like yourself — things like listening to music, going for a walk, or drawing. You choose yours once during setup, and Tawazon suggests one each day as a gentle reminder to do something that helps you.',
      },
      {
        question: 'What is the Coping Toolkit?',
        answer:
          'The Coping Toolkit is a collection of in-the-moment tools you can use when things feel difficult — breathing exercises, grounding techniques, and more. It is designed for moments when you need something now, not later.',
      },
      {
        question: 'What are CBT Tools?',
        answer:
          'CBT stands for Cognitive Behavioural Therapy. The CBT tools in Tawazon are guided exercises based on CBT principles — they help you notice unhelpful thought patterns and gently challenge them. They are not a substitute for CBT with a qualified therapist.',
      },
      {
        question: 'What is the Recovery Compass?',
        answer:
          'The Recovery Compass helps you track your recovery journey and understand where you are. It offers guidance and reflection prompts tailored to recovery from disordered eating and emotional struggles.',
      },
    ],
  },
  {
    category: 'Account & Settings',
    items: [
      {
        question: 'How do I link my parent or guardian?',
        answer:
          'Go to your Profile screen and tap "Link Parent". Your parent needs to open Tawazon and find their invite code in the Parent Dashboard. You then enter that code in the Link Parent screen to connect your accounts.',
      },
      {
        question: 'Can I delete my account?',
        answer:
          'Yes. Go to your Profile screen and tap "Delete account". This will permanently and immediately remove all your data from Tawazon. This cannot be undone.',
      },
      {
        question: 'Why does the app ask for my age range?',
        answer:
          'Your age range helps Tawazon adjust privacy messaging and content appropriately. For users under 13, a parent or guardian should be present during initial setup.',
      },
    ],
  },
]

export default function HelpScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const [openKey, setOpenKey] = useState<string | null>(null)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()
  }, [])

  const toggle = (key: string) => {
    setOpenKey(openKey === key ? null : key)
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Intro */}
          <View style={styles.introCard}>
            <Text style={styles.introEmoji}>🌿</Text>
            <Text style={styles.introTitle}>How can we help?</Text>
            <Text style={styles.introText}>
              Find answers to common questions about Tawazon below. If you need
              crisis support or someone to talk to, visit the{' '}
              <Text
                style={styles.introLink}
                onPress={() => navigation.navigate('Support')}
              >
                Support Center
              </Text>
              .
            </Text>
          </View>

          {/* Important disclaimer */}
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚠️ Important</Text>
            <Text style={styles.disclaimerText}>
              Tawazon is not a crisis service and is not a substitute for
              professional medical or psychological care. If you are in danger or
              need urgent help, please contact emergency services or a trusted adult
              immediately.
            </Text>
          </View>

          {/* FAQ sections */}
          {FAQS.map((section) => (
            <View key={section.category} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.category}</Text>
              {section.items.map((faq, i) => {
                const key = `${section.category}-${i}`
                const isOpen = openKey === key
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.faqCard, isOpen && styles.faqCardOpen]}
                    onPress={() => toggle(key)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.faqRow}>
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Text style={styles.faqChevron}>{isOpen ? '▲' : '▼'}</Text>
                    </View>
                    {isOpen && (
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}

          {/* Support Center link */}
          <TouchableOpacity
            style={styles.supportBanner}
            onPress={() => navigation.navigate('Support')}
            activeOpacity={0.85}
          >
            <View style={styles.supportBannerInner}>
              <Text style={styles.supportBannerEmoji}>🤝</Text>
              <View style={styles.supportBannerText}>
                <Text style={styles.supportBannerTitle}>Need to talk to someone?</Text>
                <Text style={styles.supportBannerSub}>
                  Visit the Support Center for UAE resources and crisis contacts
                </Text>
              </View>
              <Text style={styles.supportBannerArrow}>›</Text>
            </View>
          </TouchableOpacity>

          {/* Privacy note */}
          <View style={styles.privacyCard}>
            <Text style={styles.privacyText}>
              🔒 Your data is private and secure. Tawazon never shares your
              personal information with third parties.
            </Text>
          </View>

          <Text style={styles.versionText}>Tawazon v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: { width: 40 },
  backText: { fontSize: 14, color: '#4DB6AC', fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2E3A59' },
  scrollContent: { padding: 24, paddingBottom: 48 },
  introCard: {
    backgroundColor: '#E8F8F6',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  introEmoji: { fontSize: 32, marginBottom: 10 },
  introTitle: { fontSize: 18, fontWeight: '700', color: '#2E3A59', marginBottom: 8 },
  introText: { fontSize: 14, color: '#4DB6AC', textAlign: 'center', lineHeight: 21 },
  introLink: { fontWeight: '700', textDecorationLine: 'underline' },
  disclaimerCard: {
    backgroundColor: '#FFF3E8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#F0A500',
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#854F0B',
    marginBottom: 6,
  },
  disclaimerText: { fontSize: 13, color: '#854F0B', lineHeight: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9BA3B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  faqCardOpen: {
    borderColor: '#4DB6AC',
    backgroundColor: '#F0FAFA',
  },
  faqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  faqChevron: { fontSize: 10, color: '#4DB6AC' },
  faqAnswer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: 12,
  },
  supportBanner: {
    backgroundColor: '#2E3A59',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  supportBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  supportBannerEmoji: { fontSize: 26 },
  supportBannerText: { flex: 1 },
  supportBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  supportBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 17,
  },
  supportBannerArrow: { fontSize: 22, color: '#4DB6AC', fontWeight: '300' },
  privacyCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 12,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 19,
  },
  versionText: {
    fontSize: 12,
    color: '#C0C8D0',
    textAlign: 'center',
    marginTop: 4,
  },
})