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
import { supabase } from '../api/supabase'

const SELFWORTH_CARDS = {
  low: [
    {
      id: 1,
      title: 'You are more than how you feel today',
      body: 'Difficult feelings pass. They do not define who you are.',
    },
    {
      id: 2,
      title: 'Your worth is not up for debate',
      body: 'It does not change based on what you do, how you look, or what others think.',
    },
    {
      id: 3,
      title: 'Be as kind to yourself as you would be to a friend',
      body: 'You deserve the same gentleness you give to others.',
    },
  ],
  moderate: [
    {
      id: 1,
      title: 'You are more than how you feel today',
      body: 'Difficult feelings pass. They do not define who you are.',
    },
    {
      id: 2,
      title: 'Your worth is not up for debate',
      body: 'It does not change based on what you do, how you look, or what others think.',
    },
    {
      id: 3,
      title: 'Comparison is not a fair measure',
      body: 'What you see of others is rarely the full picture. Your journey is your own.',
    },
    {
      id: 4,
      title: 'You are allowed to have hard days',
      body: 'Struggling does not mean failing. It means you are human.',
    },
    {
      id: 5,
      title: 'Small moments of self-kindness matter',
      body: 'You do not have to feel good about yourself all at once. One small step is enough.',
    },
  ],
  high: [
    {
      id: 1,
      title: 'You are more than how you feel today',
      body: 'Difficult feelings pass. They do not define who you are.',
    },
    {
      id: 2,
      title: 'Your worth is not up for debate',
      body: 'It does not change based on what you do, how you look, or what others think.',
    },
    {
      id: 3,
      title: 'Comparison is not a fair measure',
      body: 'What you see of others is rarely the full picture. Your journey is your own.',
    },
    {
      id: 4,
      title: 'You are allowed to have hard days',
      body: 'Struggling does not mean failing. It means you are human.',
    },
    {
      id: 5,
      title: 'Small moments of self-kindness matter',
      body: 'You do not have to feel good about yourself all at once. One small step is enough.',
    },
    {
      id: 6,
      title: 'You deserve support',
      body: 'Reaching out to someone you trust is not weakness — it is one of the bravest things you can do.',
    },
    {
      id: 7,
      title: 'Your feelings are real and valid',
      body: 'Whatever you are going through, you do not have to carry it alone.',
    },
  ],
}

const REFLECTION_PROMPTS = {
  low: [
    'What is one thing about yourself that has nothing to do with how you look?',
  ],
  moderate: [
    'What is one thing about yourself that has nothing to do with how you look?',
    'When do you feel most like yourself?',
  ],
  high: [
    'What is one thing about yourself that has nothing to do with how you look?',
    'When do you feel most like yourself?',
    'What would you say to a friend who was feeling the way you feel right now?',
  ],
}

const COMPARISON_CARDS = [
  'People often share their best moments — not their everyday struggles.',
  'What you see online is a highlight, not the full story.',
  'You are comparing your inside to someone else\'s outside.',
  'Your progress does not need to look like anyone else\'s.',
]

export default function SelfWorthHubScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const [cardIndex, setCardIndex] = useState(0)
  const [comparisonIndex, setComparisonIndex] = useState(0)
  const [classificationLevel, setClassificationLevel] = useState<'low' | 'moderate' | 'high'>('low')
  const [loading, setLoading] = useState(true)
  const cardAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()
    fetchClassification()
  }, [])

  const fetchClassification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('risk_events')
        .select('severity')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
        setClassificationLevel((data?.severity as 'low' | 'moderate' | 'high') || 'low')
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  const handleNextCard = () => {
    const cards = SELFWORTH_CARDS[classificationLevel]
    Animated.sequence([
      Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(cardAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
    setCardIndex((cardIndex + 1) % cards.length)
  }

  const cards = SELFWORTH_CARDS[classificationLevel]
  const prompts = REFLECTION_PROMPTS[classificationLevel]
  const currentCard = cards[cardIndex]

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>A Space for You</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Opening message */}
          <View style={styles.openingCard}>
            <Text style={styles.openingEmoji}>🌿</Text>
            <Text style={styles.openingTitle}>You are enough</Text>
            <Text style={styles.openingText}>
              This is a gentle space to reconnect with yourself — beyond appearances, beyond comparison, beyond what anyone else thinks.
            </Text>
          </View>

          {/* Self-worth cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Self-worth reminders</Text>
            <Animated.View style={[styles.worthCard, { opacity: cardAnim }]}>
              <Text style={styles.worthCardTitle}>{currentCard.title}</Text>
              <Text style={styles.worthCardBody}>{currentCard.body}</Text>
              <View style={styles.worthCardFooter}>
                <Text style={styles.worthCardCount}>
                  {cardIndex + 1} of {cards.length}
                </Text>
                <TouchableOpacity onPress={handleNextCard}>
                  <Text style={styles.worthCardNext}>Next reminder →</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>

          {/* Comparison awareness — moderate and high only */}
          {(classificationLevel === 'moderate' || classificationLevel === 'high') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>When comparison creeps in</Text>
              <View style={styles.comparisonCard}>
                <Text style={styles.comparisonText}>
                  {COMPARISON_CARDS[comparisonIndex % COMPARISON_CARDS.length]}
                </Text>
                <TouchableOpacity
                  onPress={() => setComparisonIndex(comparisonIndex + 1)}
                  style={styles.comparisonNext}
                >
                  <Text style={styles.comparisonNextText}>Another reminder →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Reflection prompts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reflect gently</Text>
            {prompts.map((prompt, index) => (
              <View key={index} style={styles.promptCard}>
                <Text style={styles.promptText}>{prompt}</Text>
                <TouchableOpacity
                  style={styles.promptButton}
                  onPress={() => navigation.navigate('Journal')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.promptButtonText}>Write in journal →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Identity prompts — high only */}
          {classificationLevel === 'high' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Who you are</Text>
              <View style={styles.identityCard}>
                <Text style={styles.identityText}>
                  You are not defined by how you look, what you achieve, or what others think of you.
                </Text>
                <Text style={styles.identityText}>
                  You are defined by how you love, how you show up, and the quiet courage it takes to keep going.
                </Text>
              </View>
            </View>
          )}

          {/* Support pathway — high only */}
          {classificationLevel === 'high' && (
            <View style={styles.supportCard}>
              <Text style={styles.supportTitle}>You don't have to carry this alone</Text>
              <Text style={styles.supportText}>
                If things feel heavy, speaking to someone you trust can make a real difference. A school counselor or trusted adult is always a brave and positive step.
              </Text>
              <View style={styles.supportResources}>
                <Text style={styles.supportResource}>🏫 School counselor</Text>
                <Text style={styles.supportResource}>📞 Ministry of Health: 800-11111</Text>
                <Text style={styles.supportResource}>🏠 A trusted adult at home</Text>
              </View>
            </View>
          )}

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 This space is private to you. Everything here stays between you and Tawazon.
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
  openingCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  openingEmoji: { fontSize: 36, marginBottom: 12 },
  openingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
    textAlign: 'center',
  },
  openingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
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
  worthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  worthCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
    lineHeight: 24,
  },
  worthCardBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  worthCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  worthCardCount: { fontSize: 12, color: '#9BA3B0' },
  worthCardNext: { fontSize: 13, color: '#B39DDB', fontWeight: '600' },
  comparisonCard: {
    backgroundColor: '#EDE9FF',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
  },
  comparisonText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  comparisonNext: { alignSelf: 'flex-end' },
  comparisonNextText: { fontSize: 12, color: '#B39DDB', fontWeight: '500' },
  promptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  promptText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  promptButton: { alignSelf: 'flex-start' },
  promptButtonText: { fontSize: 13, color: '#4DB6AC', fontWeight: '500' },
  identityCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  identityText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  supportCard: {
    backgroundColor: '#2E3A59',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  supportText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 16,
  },
  supportResources: { gap: 8 },
  supportResource: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '500',
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