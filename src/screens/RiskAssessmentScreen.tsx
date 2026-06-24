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

const QUESTIONS = [
  {
    id: 1,
    question: 'How have you been feeling recently?',
    options: [
      { text: 'Mostly okay', emoji: '🌿', score: 0 },
      { text: 'Ups and downs', emoji: '🙂', score: 1 },
      { text: 'Often overwhelmed', emoji: '🌧️', score: 2 },
      { text: 'I find it hard to explain', emoji: '💭', score: 1 },
    ],
    response: "Thank you for sharing that 🌱 Let's understand you a little better.",
    skippable: false,
  },
  {
    id: 2,
    question: 'How often do you feel stressed during your day?',
    options: [
      { text: 'Rarely', emoji: '🌿', score: 0 },
      { text: 'Sometimes', emoji: '🙂', score: 1 },
      { text: 'Often', emoji: '🌧️', score: 2 },
      { text: 'Almost constantly', emoji: '⛈️', score: 3 },
    ],
    response: 'Got it. Stress can show up in different ways — thank you for being honest.',
    skippable: false,
  },
  {
    id: 3,
    question: 'How is your energy most days?',
    options: [
      { text: 'Stable', emoji: '🌿', score: 0 },
      { text: 'A bit low sometimes', emoji: '🙂', score: 1 },
      { text: 'Often tired', emoji: '🌧️', score: 2 },
      { text: 'Exhausted most of the time', emoji: '⛈️', score: 3 },
    ],
    response: 'Your energy patterns help us understand your balance 🌱',
    skippable: false,
  },
  {
    id: 4,
    question: 'How comfortable do you feel around food and eating routines?',
    options: [
      { text: 'Comfortable and relaxed', emoji: '🌿', score: 0 },
      { text: 'Sometimes overthink it', emoji: '🙂', score: 1 },
      { text: 'Often feel stressed or guilty', emoji: '🌧️', score: 2 },
      { text: 'I prefer not to say', emoji: '💭', score: 1 },
    ],
    response: "Thank you for trusting us with that. We'll take this step by step 🌿",
    skippable: false,
  },
  {
    id: 5,
    question: 'How do you generally feel about your body?',
    options: [
      { text: 'Mostly neutral or positive', emoji: '🌿', score: 0 },
      { text: 'Some insecurities', emoji: '🙂', score: 1 },
      { text: 'Often critical thoughts', emoji: '🌧️', score: 2 },
      { text: "I'd rather skip", emoji: '💭', score: 0 },
    ],
    response: "That's okay. You can always skip questions you're not ready for.",
    skippable: true,
  },
  {
    id: 6,
    question: 'Do you feel supported by people around you?',
    options: [
      { text: 'Yes, very supported', emoji: '🌿', score: 0 },
      { text: 'Somewhat', emoji: '🙂', score: 1 },
      { text: 'Not really', emoji: '🌧️', score: 2 },
      { text: 'I feel alone sometimes', emoji: '⛈️', score: 3 },
    ],
    response: 'Support systems matter. Thank you for sharing 🌱',
    skippable: false,
  },
  {
    id: 7,
    question: 'How has your sleep been lately?',
    options: [
      { text: 'Good and consistent', emoji: '🌿', score: 0 },
      { text: 'Slightly irregular', emoji: '🙂', score: 1 },
      { text: 'Poor sleep most nights', emoji: '🌧️', score: 2 },
      { text: 'Very disrupted', emoji: '⛈️', score: 3 },
    ],
    response: 'Sleep patterns help us understand recovery balance 🌙',
    skippable: false,
  },
]

const getClassification = (score: number) => {
  if (score <= 5) return {
    level: 'low',
    balanceStart: 30,
    message: "You seem to have a steady balance right now 🌿 Let's keep supporting that.",
  }
  if (score <= 11) return {
    level: 'moderate',
    balanceStart: 30,
    message: "We notice some ups and downs in your balance. That's okay — we'll take it step by step 🌱",
  }
  return {
    level: 'high',
    balanceStart: 30,
    message: "It looks like things may feel heavy lately. You don't have to go through this alone 🌿 We'll move gently with you.",
  }
}

export default function RiskAssessmentScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const responseAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current

  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResponse, setShowResponse] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [showFinal, setShowFinal] = useState(false)
  const [classification, setClassification] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    animateIn()
  }, [currentQ])

  const animateIn = () => {
    fadeAnim.setValue(0)
    slideAnim.setValue(30)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const animateProgress = (step: number) => {
    Animated.timing(progressAnim, {
      toValue: step / QUESTIONS.length,
      duration: 400,
      useNativeDriver: false,
    }).start()
  }

  const handleSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex)
  }

  const handleNext = () => {
    if (selectedOption === null) return
    const score = QUESTIONS[currentQ].options[selectedOption].score
    const newScores = [...scores, score]
    setScores(newScores)
    setShowResponse(true)
    responseAnim.setValue(0)
    Animated.timing(responseAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start()
    animateProgress(currentQ + 1)
    setTimeout(() => {
      setShowResponse(false)
      setSelectedOption(null)
      if (currentQ + 1 >= QUESTIONS.length) {
        const total = newScores.reduce((a, b) => a + b, 0)
        const result = getClassification(total)
        setClassification(result)
        setShowFinal(true)
      } else {
        setCurrentQ(currentQ + 1)
      }
    }, 2000)
  }

  const handleSkip = () => {
    const newScores = [...scores, 0]
    setScores(newScores)
    setSelectedOption(null)
    animateProgress(currentQ + 1)
    if (currentQ + 1 >= QUESTIONS.length) {
      const total = newScores.reduce((a, b) => a + b, 0)
      const result = getClassification(total)
      setClassification(result)
      setShowFinal(true)
    } else {
      setCurrentQ(currentQ + 1)
    }
  }

  const handleSeeBalance = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && classification) {
        await supabase.from('student_profiles').upsert({
          id: user.id,
          check_in_streak: 0,
        })
        await supabase.from('risk_events').insert({
          student_id: user.id,
          triggered_rules: [classification.level],
          severity: classification.level === 'high'
            ? 'high'
            : classification.level === 'moderate'
            ? 'moderate'
            : 'low',
          recommendation: classification.message,
          parent_notify: classification.level === 'high',
        })
      }
    } catch (e) {
      console.log('Save error:', e)
    } finally {
        setSaving(false)
        navigation.navigate('MoodTrigger')
      }
    }

  const question = QUESTIONS[currentQ]

  if (showFinal) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <Animated.View style={[styles.finalContent, { opacity: fadeAnim }]}>
          <Text style={styles.finalEmoji}>🌿</Text>
          <Text style={styles.finalTitle}>Thank you for sharing with us</Text>
          <Text style={styles.finalSubtitle}>
            This helps Tawazon understand your current balance and support your journey
          </Text>
          <View style={styles.classificationCard}>
            <Text style={styles.classificationText}>
              {classification?.message}
            </Text>
          </View>
          <Text style={styles.finalNote}>
            This is not a diagnosis. Tawazon is here to support you, not label you.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSeeBalance}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Setting up your space...' : 'See My Balance '}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.progressContainer}>
        <Text style={styles.quizTitle}>Understanding You 🌿</Text>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQ + 1} of {QUESTIONS.length}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {showResponse && (
            <Animated.View
              style={[styles.responseBubble, { opacity: responseAnim }]}
            >
              <Text style={styles.responseText}>
                {question.response}
              </Text>
            </Animated.View>
          )}

          {!showResponse && (
            <>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>
                  Question {currentQ + 1}
                </Text>
                <Text style={styles.questionText}>
                  {question.question}
                </Text>
              </View>

              <View style={styles.optionsContainer}>
                {question.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionCard,
                      selectedOption === index && styles.optionCardSelected,
                    ]}
                    onPress={() => handleSelect(index)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.optionText,
                      selectedOption === index && styles.optionTextSelected,
                    ]}>
                      {option.text}
                    </Text>
                    <View style={[
                      styles.radioOuter,
                      selectedOption === index && styles.radioOuterSelected,
                    ]}>
                      {selectedOption === index && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {question.skippable && (
                <TouchableOpacity
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <Text style={styles.skipText}>Skip this question</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  selectedOption === null && styles.buttonDisabled,
                ]}
                onPress={handleNext}
                disabled={selectedOption === null}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {currentQ + 1 === QUESTIONS.length ? 'See my reflection' : 'Next'}
                </Text>
              </TouchableOpacity>

              <View style={styles.privacyNote}>
                <Text style={styles.privacyText}>
                  🔒 Your answers are private and never shared
                </Text>
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4DB6AC',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#9BA3B0',
    textAlign: 'right',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  responseBubble: {
    backgroundColor: '#F0FAFA',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 20,
    marginVertical: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  responseText: {
    fontSize: 16,
    color: '#2E3A59',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  questionHeader: {
    marginBottom: 24,
    marginTop: 8,
  },
  questionNumber: {
    fontSize: 12,
    color: '#4DB6AC',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: '#4DB6AC',
    backgroundColor: '#F0FAFA',
  },
  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#2E3A59',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#4DB6AC',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E8ECF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioOuterSelected: {
    borderColor: '#4DB6AC',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4DB6AC',
  },
  skipButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  skipText: {
    fontSize: 13,
    color: '#9BA3B0',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  privacyNote: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#9BA3B0',
  },
  finalContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  finalEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  finalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    textAlign: 'center',
    marginBottom: 12,
  },
  finalSubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  classificationCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
    width: '100%',
  },
  classificationText: {
    fontSize: 15,
    color: '#2E3A59',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  finalNote: {
    fontSize: 12,
    color: '#9BA3B0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
})