import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native'
import { supabase } from '../api/supabase'

const MOODS = [
  { label: 'Struggling', emoji: '😔', score: 1 },
  { label: 'Okay', emoji: '😐', score: 2 },
  { label: 'Good', emoji: '🙂', score: 3 },
  { label: 'Great', emoji: '😊', score: 4 },
]

const MICRO_WIN_MESSAGES = [
  'You took a moment for yourself today.',
  'Checking in is an act of self-care.',
  'Every check-in helps your Balance Tree grow.',
  'Thank you for showing up for yourself today.',
  'Small steps forward still count.',
]

export default function CheckInScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const buttonScale = useRef(new Animated.Value(1)).current

  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [stressLevel, setStressLevel] = useState(3)
  const [sleepQuality, setSleepQuality] = useState(3)
  const [note, setNote] = useState('')
  const [noteFocused, setNoteFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [microWin, setMicroWin] = useState('')

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
    checkAlreadyDone()
  }, [])

  const checkAlreadyDone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const today = new Date().toISOString().split('T')[0]
        const { data } = await supabase
          .from('daily_checkins')
          .select('id')
          .eq('student_id', user.id)
          .eq('checkin_date', today)
          .single()
        if (data) setDone(true)
      }
    } catch (e) {
      console.log('Check error:', e)
    }
  }

  const pressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start()
  }

  const pressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const handleSubmit = async () => {
    if (selectedMood === null) {
      setError('Please select how you are feeling today')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const today = new Date().toISOString().split('T')[0]
        const { error } = await supabase
          .from('daily_checkins')
          .insert({
            student_id: user.id,
            mood_score: MOODS[selectedMood].score,
            stress_score: stressLevel,
            sleep_quality: sleepQuality,
            eating_regularity: 3,
            note: note || null,
            checkin_date: today,
          })
        if (error) {
          setError('Something went wrong. Please try again.')
        } else {
          await updateStreak(user.id)
          const win = MICRO_WIN_MESSAGES[
            Math.floor(Math.random() * MICRO_WIN_MESSAGES.length)
          ]
          setMicroWin(win)
          const moodScore = MOODS[selectedMood!].score
          if (moodScore <= 2 || stressLevel >= 4) {
            navigation.navigate('MicroIntervention', {
              moodScore,
              stressLevel,
            })
          } else {
            setDone(true)
          }
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateStreak = async (userId: string) => {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const { data } = await supabase
        .from('daily_checkins')
        .select('id')
        .eq('student_id', userId)
        .eq('checkin_date', yesterdayStr)
        .single()
      const { data: profile } = await supabase
        .from('student_profiles')
        .select('check_in_streak')
        .eq('id', userId)
        .single()
      const currentStreak = profile?.check_in_streak || 0
      const newStreak = data ? currentStreak + 1 : 1
      await supabase
        .from('student_profiles')
        .upsert({ id: userId, check_in_streak: newStreak })
    } catch (e) {
      console.log('Streak error:', e)
    }
  }

  const SliderBar = ({
    value,
    onChange,
    color,
  }: {
    value: number
    onChange: (v: number) => void
    color: string
  }) => {
    return (
      <View style={styles.sliderContainer}>
        {[1, 2, 3, 4, 5].map((v) => (
          <TouchableOpacity
            key={v}
            style={[
              styles.sliderDot,
              value >= v && { backgroundColor: color },
            ]}
            onPress={() => onChange(v)}
          />
        ))}
      </View>
    )
  }

  const getSliderLabel = (value: number, type: 'stress' | 'sleep') => {
    if (type === 'stress') {
      const labels = ['Very low', 'Low', 'Moderate', 'High', 'Very high']
      return labels[value - 1]
    } else {
      const labels = ['Very poor', 'Poor', 'Okay', 'Good', 'Great']
      return labels[value - 1]
    }
  }

  if (done) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <Animated.View style={[styles.doneContent, { opacity: fadeAnim }]}>
          <Text style={styles.doneEmoji}>🌿</Text>
          <Text style={styles.doneTitle}>Check-in complete</Text>
          <Text style={styles.doneSubtitle}>{microWin}</Text>
          <View style={styles.doneCard}>
            <Text style={styles.doneCardText}>
              Your check-in is saved privately. Your Balance Tree is growing.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('StudentHome')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Back to home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Coping')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Try a coping tool</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Check-in</Text>
        <View style={{ width: 40 }} />
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
          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              Your check-in is private to you
            </Text>
          </View>

          {/* Mood selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((mood, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.moodCard,
                    selectedMood === index && styles.moodCardSelected,
                  ]}
                  onPress={() => setSelectedMood(index)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    selectedMood === index && styles.moodLabelSelected,
                  ]}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stress slider */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionTitle}>Stress level</Text>
              <Text style={[styles.sliderValue, { color: '#B39DDB' }]}>
                {getSliderLabel(stressLevel, 'stress')}
              </Text>
            </View>
            <SliderBar
              value={stressLevel}
              onChange={setStressLevel}
              color="#B39DDB"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>Low</Text>
              <Text style={styles.sliderLabelText}>High</Text>
            </View>
          </View>

          {/* Sleep slider */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionTitle}>Sleep quality</Text>
              <Text style={[styles.sliderValue, { color: '#4DB6AC' }]}>
                {getSliderLabel(sleepQuality, 'sleep')}
              </Text>
            </View>
            <SliderBar
              value={sleepQuality}
              onChange={setSleepQuality}
              color="#4DB6AC"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>Poor</Text>
              <Text style={styles.sliderLabelText}>Great</Text>
            </View>
          </View>

          {/* Optional note */}
          <View style={styles.section}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sectionTitle}>Anything on your mind?</Text>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
            <View style={styles.privacyBadge}>
              <Text style={styles.privacyBadgeText}>
                Private to you — never shared
              </Text>
            </View>
            <TextInput
              style={[
                styles.noteInput,
                noteFocused && styles.noteInputFocused,
              ]}
              placeholder="Write anything — just for you..."
              placeholderTextColor="#C0C8D0"
              value={note}
              onChangeText={setNote}
              onFocus={() => setNoteFocused(true)}
              onBlur={() => setNoteFocused(false)}
              multiline
              numberOfLines={3}
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Submit button */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.button,
                selectedMood === null && styles.buttonDisabled,
                loading && styles.buttonDisabled,
              ]}
              onPressIn={pressIn}
              onPressOut={pressOut}
              onPress={handleSubmit}
              disabled={selectedMood === null || loading}
              activeOpacity={1}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Log my day'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

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
  backButton: {
    width: 40,
  },
  backText: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E3A59',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 24,
  },
  privacyNote: {
    backgroundColor: '#F0FAFA',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 12,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 14,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  moodCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  moodCardSelected: {
    borderColor: '#4DB6AC',
    backgroundColor: '#F0FAFA',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 11,
    color: '#9BA3B0',
    fontWeight: '500',
    textAlign: 'center',
  },
  moodLabelSelected: {
    color: '#4DB6AC',
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  sliderDot: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 11,
    color: '#9BA3B0',
  },
  optionalText: {
    fontSize: 12,
    color: '#9BA3B0',
  },
  privacyBadge: {
    backgroundColor: '#EDE9FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  privacyBadgeText: {
    fontSize: 11,
    color: '#6C5CE7',
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#2E3A59',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noteInputFocused: {
    borderColor: '#4DB6AC',
  },
  errorText: {
    fontSize: 13,
    color: '#E05555',
    textAlign: 'center',
    marginBottom: 12,
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
  doneContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  doneEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 15,
    color: '#9BA3B0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  doneCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 16,
    marginBottom: 32,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  doneCardText: {
    fontSize: 13,
    color: '#4DB6AC',
    lineHeight: 20,
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#4DB6AC',
    fontSize: 15,
    fontWeight: '600',
  },
})