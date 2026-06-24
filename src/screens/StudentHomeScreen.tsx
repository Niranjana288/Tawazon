import { useRef, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import React from 'react'
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

const REFLECTION_PROMPTS = [
    "What made today a little easier?",
    "What's something you handled better than you expected?",
    "How is your body feeling right now, not just your mind?",
    "What's one thing you're grateful for today?",
    "What would make tomorrow feel a little lighter?",
    "What emotion has been with you most today?",
    "What's something kind you did for yourself today?",
    "What's one small thing that went well today?",
    "If today had a color, what would it be and why?",
    "What's something you're looking forward to tomorrow?",
    "Who made you smile today, even a little?",
    "What's something you wish people understood about you?",
    "When did you feel most like yourself today?",
    "What would you tell a friend who had the same day as you?",
    "What's one thing you did today that took courage?",
    "What's something you want to let go of from today?",
    "What does your body need right now?",
    "What made you feel safe today?",
    "What's one thing you learned about yourself this week?",
    "If you could change one thing about today, what would it be?",
    "What are you carrying that you don't need to carry alone?",
    "What's a small victory you haven't celebrated yet?",
    "When did you feel most calm today?",
    "What's something that surprised you today?",
    "What do you need to hear right now?",
    "What made today different from yesterday?",
    "What's one thing you're proud of yourself for lately?",
    "How have you grown in the past month?",
    "What does balance feel like to you right now?",
    "If today was a chapter in your story, what would you call it?",
  ]

const getBalanceOrganism = (score: number) => {
  if (score <= 20) return { emoji: '🌰', state: 'Seed', message: 'Your journey is just beginning' }
  if (score <= 40) return { emoji: '🌱', state: 'Sprout', message: "You're starting to grow" }
  if (score <= 60) return { emoji: '🌿', state: 'Growing', message: 'Your balance is developing' }
  if (score <= 80) return { emoji: '🌳', state: 'Blooming', message: "You're becoming more stable" }
  return { emoji: '🌲', state: 'Thriving', message: "You're in a great place" }
}

export default function StudentHomeScreen({ navigation, route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const plantScale = useRef(new Animated.Value(0.8)).current
  const plantPulse = useRef(new Animated.Value(1)).current
  const microWinAnim = useRef(new Animated.Value(0)).current

  const [userName, setUserName] = useState('there')
  const [streak, setStreak] = useState(0)
  const [balanceIndex, setBalanceIndex] = useState(
    route.params?.balanceStart || 50
  )
  const [boostersSetupDone, setBoostersSetupDone] = useState(false)
  const [todayBooster, setTodayBooster] = useState<any>(null)
  const [showMicroWin, setShowMicroWin] = useState(false)
  const [microWinMessage, setMicroWinMessage] = useState('')
  const [moodTriggers, setMoodTriggers] = useState<string[]>([])
  const [realityCardIndex, setRealityCardIndex] = useState(0)
  const todayPrompt = REFLECTION_PROMPTS[Math.floor((Date.now() / 86400000)) % REFLECTION_PROMPTS.length]
  const organism = getBalanceOrganism(balanceIndex)
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData()
    }, [])
  )
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
      Animated.spring(plantScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(plantPulse, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(plantPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
  .from('profiles')
  .select('full_name, balance_boosters, boosters_setup_done, mood_triggers')
  .eq('id', user.id)
  .single()
if (data?.full_name) {
  setUserName(data.full_name.split(' ')[0])
}
if (data?.mood_triggers) {
  setMoodTriggers(data.mood_triggers)
}
if (data?.boosters_setup_done) {
  setBoostersSetupDone(true)
  if (data?.balance_boosters?.length > 0) {
    const allItems = [
      { id: 'listening_music', label: 'Listen to Music', emoji: '🎧' },
      { id: 'drawing', label: 'Drawing', emoji: '✏️' },
      { id: 'walking', label: 'Walking', emoji: '🚶' },
      { id: 'reading', label: 'Reading', emoji: '📖' },
      { id: 'breathing', label: 'Breathing', emoji: '🌬️' },
      { id: 'gaming', label: 'Gaming', emoji: '🎮' },
      { id: 'writing', label: 'Writing', emoji: '✍️' },
      { id: 'nature', label: 'Nature', emoji: '🌿' },
      { id: 'meditation', label: 'Meditation', emoji: '🧘' },
      { id: 'dancing', label: 'Dancing', emoji: '💃' },
      { id: 'movies', label: 'Movies', emoji: '🎥' },
      { id: 'singing', label: 'Singing', emoji: '🎤' },
      { id: 'stretching', label: 'Stretching', emoji: '🧘' },
      { id: 'photography', label: 'Photography', emoji: '📷' },
      { id: 'crafts', label: 'Crafts', emoji: '🧶' },
      { id: 'cycling', label: 'Cycling', emoji: '🚴' },
    ]
    const selected = allItems.filter(i => data.balance_boosters.includes(i.id))
    if (selected.length > 0) {
      setTodayBooster(selected[Math.floor(Math.random() * selected.length)])
    }
  }
}
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('check_in_streak')
          .eq('id', user.id)
          .single()
        if (studentData?.check_in_streak) {
          setStreak(studentData.check_in_streak)
        }
      }
    } catch (e) {
      console.log('Fetch error:', e)
    }
  }

  const showWin = (message: string) => {
    setMicroWinMessage(message)
    setShowMicroWin(true)
    microWinAnim.setValue(0)
    Animated.sequence([
      Animated.timing(microWinAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(microWinAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => setShowMicroWin(false))
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getBalanceColor = () => {
    if (balanceIndex >= 61) return '#4DB6AC'
    if (balanceIndex >= 41) return '#B39DDB'
    return '#F48FB1'
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Micro-win popup */}
      {showMicroWin && (
        <Animated.View
          style={[
            styles.microWin,
            {
              opacity: microWinAnim,
              transform: [{
                translateY: microWinAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={styles.microWinText}>{microWinMessage}</Text>
        </Animated.View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Balance Organism Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <View style={styles.balanceTextSection}>
                <Text style={styles.balanceLabel}>Balance Index</Text>
                <Text style={styles.balanceSubLabel}>{organism.message}</Text>
              </View>
              <Animated.Text
                style={[
                  styles.plantEmoji,
                  {
                    transform: [
                      { scale: plantScale },
                      { scale: plantPulse },
                    ],
                  },
                ]}
              >
                {organism.emoji}
              </Animated.Text>
            </View>
            <View style={styles.balanceBar}>
              <View
                style={[
                  styles.balanceFill,
                  {
                    width: `${balanceIndex}%` as any,
                    backgroundColor: getBalanceColor(),
                  },
                ]}
              />
            </View>
            <View style={styles.balanceBottom}>
              <Text style={styles.balanceState}>{organism.state}</Text>
              <Text style={[styles.balanceScore, { color: getBalanceColor() }]}>
                {balanceIndex}/100
              </Text>
            </View>
          </View>

          {/* Streak + Reflection row */}
          <View style={styles.rowCards}>
            <View style={styles.streakCard}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakCount}>{streak}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>

            <View style={styles.reflectionCard}>
              <Text style={styles.reflectionTitle}>Today's reflection</Text>
              <Text style={styles.reflectionPrompt}>{todayPrompt}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Journal')}
                style={styles.reflectionButton}
              >
                <Text style={styles.reflectionButtonText}>Reflect</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#E8F8F6' }]}
              onPress={() => {
                showWin('You checked in with yourself today')
                navigation.navigate('CheckIn')
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTitle}>Daily Check-in</Text>
              <Text style={styles.actionSubtitle}>Log how you feel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#EDE9FF' }]}
              onPress={() => navigation.navigate('Journal')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionIcon}>🔒</Text>
              <Text style={styles.actionTitle}>Journal Vault</Text>
              <Text style={styles.actionSubtitle}>Private to you</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#FFF3E8' }]}
              onPress={() => navigation.navigate('CBT')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionIcon}>🧠</Text>
              <Text style={styles.actionTitle}>CBT Tools</Text>
              <Text style={styles.actionSubtitle}>Learn and grow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#F0F8FF' }]}
              onPress={() => navigation.navigate('Coping')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionIcon}>🌿</Text>
              <Text style={styles.actionTitle}>Coping Toolkit</Text>
              <Text style={styles.actionSubtitle}>Feel better now</Text>
            </TouchableOpacity>
          </View>
          {/* Balance Boosters banner — shown if not set up */}
          {!boostersSetupDone && (
            <TouchableOpacity
              style={styles.boostersBanner}
              onPress={() => navigation.navigate('BalanceBoosters', { isSetup: true })}
              activeOpacity={0.85}
            >
              <Text style={styles.boostersBannerEmoji}>🌿</Text>
              <View style={styles.boostersBannerText}>
                <Text style={styles.boostersBannerTitle}>Personalize your experience</Text>
                <Text style={styles.boostersBannerSubtitle}>Tell us what helps you feel like yourself →</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Today's Balance Booster card */}
          {boostersSetupDone && todayBooster && (
            <TouchableOpacity
              style={styles.boosterCard}
              onPress={() => navigation.navigate('BalanceBoosters')}
              activeOpacity={0.85}
            >
              <Text style={styles.boosterCardLabel}>Today's Balance Booster</Text>
              <View style={styles.boosterCardMain}>
                <Text style={styles.boosterCardEmoji}>{todayBooster.emoji}</Text>
                <Text style={styles.boosterCardName}>{todayBooster.label}</Text>
              </View>
              <Text style={styles.boosterCardHint}>Tap to explore →</Text>
            </TouchableOpacity>
          )}
           {/* Reality Check card — shown if social media or body image selected */}
          {(moodTriggers.includes('social_media') || moodTriggers.includes('body_image')) && (
            <View style={styles.realityCard}>
              <Text style={styles.realityCardLabel}>Reality Check</Text>
              <Text style={styles.realityCardText}>
                {[
                  "People often share their best moments online — not their everyday struggles.",
                  "Your progress doesn't need to look like someone else's.",
                  "A person's worth cannot be measured by appearance, followers, or achievements.",
                  "What you see online is a highlight reel, not the full story.",
                  "You are allowed to grow at your own pace.",
                  "Comparison is the thief of joy. Your journey is uniquely yours.",
                  "Social media shows moments, not reality. You are enough as you are.",
                ][realityCardIndex % 7]}
              </Text>
              <TouchableOpacity
                onPress={() => setRealityCardIndex(realityCardIndex + 1)}
                style={styles.realityCardNext}
              >
                <Text style={styles.realityCardNextText}>Next reminder →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Emotional continuity */}
          <View style={styles.continuityCard}>
            <Text style={styles.continuityText}>
              Keep checking in daily — your Balance Tree grows with every visit.
            </Text>
          </View>

          {/* Privacy reminder */}
          <View style={styles.privacyReminder}>
            <Text style={styles.privacyText}>
              Your check-ins and journal are always private to you
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
      {/* Tawazon Guide floating button */}
      <TouchableOpacity
        style={styles.floatingGuideButton}
        onPress={() => navigation.navigate('TawazonGuide')}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingGuideEmoji}>🌿</Text>
      </TouchableOpacity>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CheckIn')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Journal')}
        >
          <Text style={styles.navIcon}>📔</Text>
          <Text style={styles.navLabel}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Compass')}
        >
          <Text style={styles.navIcon}>🧭</Text>
          <Text style={styles.navLabel}>Compass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  content: {
    padding: 24,
  },
  microWin: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
    zIndex: 100,
    backgroundColor: '#2E3A59',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  microWinText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 48,
  },
  greeting: {
    fontSize: 14,
    color: '#9BA3B0',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4DB6AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  balanceTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceTextSection: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  balanceSubLabel: {
    fontSize: 12,
    color: '#9BA3B0',
  },
  plantEmoji: {
    fontSize: 48,
    marginLeft: 12,
  },
  balanceBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  balanceFill: {
    height: '100%',
    borderRadius: 4,
  },
  balanceBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceState: {
    fontSize: 12,
    color: '#9BA3B0',
    fontWeight: '500',
  },
  balanceScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: '#FFF8E8',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  streakEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  streakCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
  },
  streakLabel: {
    fontSize: 10,
    color: '#9BA3B0',
    textAlign: 'center',
  },
  reflectionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  reflectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B39DDB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reflectionPrompt: {
    fontSize: 13,
    color: '#2E3A59',
    lineHeight: 18,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  reflectionButton: {
    alignSelf: 'flex-start',
  },
  reflectionButtonText: {
    fontSize: 12,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#9BA3B0',
  },
  continuityCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  continuityText: {
    fontSize: 12,
    color: '#4DB6AC',
    lineHeight: 18,
    textAlign: 'center',
  },
  privacyReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  privacyText: {
    fontSize: 12,
    color: '#9BA3B0',
    flex: 1,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.4,
  },
  navIconActive: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 10,
    color: '#9BA3B0',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  boostersBanner: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  boostersBannerEmoji: { fontSize: 24 },
  boostersBannerText: { flex: 1 },
  boostersBannerTitle: { fontSize: 14, fontWeight: '600', color: '#2E3A59', marginBottom: 2 },
  boostersBannerSubtitle: { fontSize: 12, color: '#4DB6AC' },
  boosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#E8F8F6',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  boosterCardLabel: {
    fontSize: 11,
    color: '#4DB6AC',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  boosterCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  boosterCardEmoji: { fontSize: 28 },
  boosterCardName: { fontSize: 17, fontWeight: '700', color: '#2E3A59' },
  boosterCardHint: { fontSize: 12, color: '#9BA3B0' },
  realityCard: {
    backgroundColor: '#EDE9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
  },
  realityCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B39DDB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  realityCardText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  realityCardNext: {
    alignSelf: 'flex-end',
  },
  realityCardNextText: {
    fontSize: 12,
    color: '#B39DDB',
    fontWeight: '500',
  },
  floatingGuideButton: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E3A59',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E3A59',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  floatingGuideEmoji: { fontSize: 24 },
})