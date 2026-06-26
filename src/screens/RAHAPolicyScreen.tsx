import { useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native'

const PILLARS = [
  {
    letter: 'R',
    title: 'Recognition',
    subtitle: 'Early Detection and Intervention',
    color: '#4DB6AC',
    background: '#E8F8F6',
    points: [
      'Annual eating disorder screening in schools and universities',
      'Training counselors and teachers to recognize early warning signs',
      'Standardized referral pathways to specialized healthcare',
      'Routine mental health check-ups including risk assessments',
    ],
  },
  {
    letter: 'A',
    title: 'Awareness',
    subtitle: 'Education and Stigma Reduction',
    color: '#B39DDB',
    background: '#EDE9FF',
    points: [
      'National awareness campaigns for students, parents and educators',
      'Eating disorder education integrated into school curricula',
      'Positive body image and media literacy programs',
      'Social media campaigns to combat misinformation and stigma',
    ],
  },
  {
    letter: 'H',
    title: 'Healing',
    subtitle: 'Accessible and Comprehensive Treatment',
    color: '#F0A500',
    background: '#FFF8E8',
    points: [
      'Expanded access to specialized treatment centers across the UAE',
      'Multidisciplinary care teams including psychologists and dietitians',
      'Enhanced CBT with culturally sensitive adaptations',
      'Family-based interventions to strengthen recovery support',
    ],
  },
  {
    letter: 'A',
    title: 'Action',
    subtitle: 'Research, Innovation and Policy Development',
    color: '#4A90D9',
    background: '#E6F1FB',
    points: [
      'National Eating Disorders Research Program',
      'Studies on social media, beauty standards and family expectations',
      'Partnerships between universities and healthcare institutions',
      'Evidence-based policies tailored to the UAE population',
    ],
  },
]

export default function RAHAPolicyScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RAHA Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEmoji}>🌿</Text>
            <Text style={styles.heroTitle}>RAHA</Text>
            <Text style={styles.heroSubtitle}>
              Recognition, Awareness, Healing and Action
            </Text>
            <Text style={styles.heroDesc}>
              A National Framework for the Prevention, Early Detection, and Treatment of Eating Disorders in the UAE
            </Text>
          </View>

          {/* Vision */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vision</Text>
            <View style={styles.visionCard}>
              <Text style={styles.visionText}>
                To create a UAE where every young person has access to early support, stigma-free treatment, and culturally appropriate resources for eating disorder prevention and recovery.
              </Text>
            </View>
          </View>

          {/* Mission */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mission</Text>
            <View style={styles.missionCard}>
              <Text style={styles.missionText}>
                To establish a nationwide framework that promotes awareness, facilitates early identification, ensures equitable access to multidisciplinary treatment, and supports research-driven solutions tailored to the UAE's unique cultural context.
              </Text>
            </View>
          </View>

          {/* Four pillars */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Four Pillars</Text>
            {PILLARS.map((pillar, index) => (
              <View
                key={index}
                style={[
                  styles.pillarCard,
                  { backgroundColor: pillar.background, borderLeftColor: pillar.color },
                ]}
              >
                <View style={styles.pillarHeader}>
                  <View style={[styles.pillarLetter, { backgroundColor: pillar.color }]}>
                    <Text style={styles.pillarLetterText}>{pillar.letter}</Text>
                  </View>
                  <View style={styles.pillarTitleBlock}>
                    <Text style={[styles.pillarTitle, { color: pillar.color }]}>
                      {pillar.title}
                    </Text>
                    <Text style={styles.pillarSubtitle}>{pillar.subtitle}</Text>
                  </View>
                </View>
                {pillar.points.map((point, i) => (
                  <View key={i} style={styles.pillarPoint}>
                    <View style={[styles.pillarDot, { backgroundColor: pillar.color }]} />
                    <Text style={styles.pillarPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Mental Health Data Sovereignty Act */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mental Health Data Sovereignty Act</Text>
            <View style={styles.mhdsaCard}>
              <Text style={styles.mhdsaTitle}>Your data is protected</Text>
              {[
                'All mental health data is stored within the UAE',
                'Your privacy and confidentiality are protected by national regulations',
                'Informed consent is obtained before any data collection',
                'AI tools used in Tawazon are transparent and regularly audited',
                'Data is only used for approved healthcare purposes',
              ].map((point, index) => (
                <View key={index} style={styles.mhdsaPoint}>
                  <Text style={styles.mhdsaCheck}>✓</Text>
                  <Text style={styles.mhdsaPointText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Tawazon under RAHA */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tawazon under RAHA</Text>
            <View style={styles.tawazonCard}>
              <Text style={styles.tawazonCardTitle}>
                Tawazon is a digital therapeutic platform developed under the RAHA Policy
              </Text>
              {[
                'Self-screening and early risk assessment',
                'Guided CBT-based recovery modules',
                'Mental health education resources',
                'Mood and emotional wellbeing tracking',
                'Direct pathways to healthcare professionals',
                'Parent and caregiver support resources',
                'Arabic and English language accessibility',
              ].map((feature, index) => (
                <View key={index} style={styles.tawazonFeature}>
                  <Text style={styles.tawazonFeatureEmoji}>🌿</Text>
                  <Text style={styles.tawazonFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Professional support reminder */}
          <View style={styles.supportReminder}>
            <Text style={styles.supportReminderTitle}>
              Using Tawazon alongside professional care
            </Text>
            <Text style={styles.supportReminderText}>
              If you are currently receiving support from a healthcare professional, therapist, or treatment team, please use Tawazon alongside — not instead of — that care. Tawazon is a wellbeing companion, not a clinical tool.
            </Text>
          </View>

          {/* UAE resources */}
          <View style={styles.resourcesCard}>
            <Text style={styles.resourcesTitle}>UAE Support Resources</Text>
            <TouchableOpacity
              style={styles.resourceItem}
              onPress={() => Linking.openURL('tel:80011111')}
            >
              <Text style={styles.resourceItemText}>
                📞 Emirates Health Services: 800-11111
              </Text>
            </TouchableOpacity>
            <Text style={styles.resourceItem}>
              <Text style={styles.resourceItemText}>
                🏫 School counselor — most accessible first step for teens
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SupportCenter')}
              style={styles.supportCenterButton}
            >
              <Text style={styles.supportCenterButtonText}>
                View full Support Center →
              </Text>
            </TouchableOpacity>
          </View>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 Everything in Tawazon is private. Your data is protected under the Mental Health Data Sovereignty Act.
            </Text>
          </View>

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
  scrollContent: { padding: 24, paddingBottom: 40 },
  heroCard: {
    backgroundColor: '#2E3A59',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroEmoji: { fontSize: 36, marginBottom: 12 },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4DB6AC',
    marginBottom: 6,
    letterSpacing: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 22,
  },
  heroDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 18,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BA3B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  visionCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  visionText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  missionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 16,
  },
  missionText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
  },
  pillarCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  pillarLetter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarLetterText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  pillarTitleBlock: { flex: 1 },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  pillarSubtitle: {
    fontSize: 12,
    color: '#9BA3B0',
  },
  pillarPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  pillarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  pillarPointText: {
    fontSize: 13,
    color: '#2E3A59',
    lineHeight: 20,
    flex: 1,
  },
  mhdsaCard: {
    backgroundColor: '#2E3A59',
    borderRadius: 16,
    padding: 18,
  },
  mhdsaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4DB6AC',
    marginBottom: 14,
  },
  mhdsaPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  mhdsaCheck: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '700',
  },
  mhdsaPointText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    flex: 1,
  },
  tawazonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  tawazonCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
    lineHeight: 22,
    marginBottom: 14,
  },
  tawazonFeature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tawazonFeatureEmoji: { fontSize: 14, marginTop: 2 },
  tawazonFeatureText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    flex: 1,
  },
  supportReminder: {
    backgroundColor: '#FFF8E8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F0A500',
  },
  supportReminderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#854F0B',
    marginBottom: 8,
  },
  supportReminderText: {
    fontSize: 12,
    color: '#854F0B',
    lineHeight: 20,
  },
  resourcesCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  resourcesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 12,
  },
  resourceItem: {
    marginBottom: 10,
  },
  resourceItemText: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  supportCenterButton: {
    marginTop: 8,
  },
  supportCenterButtonText: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  privacyNote: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  privacyText: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 18,
  },
})