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
  Dimensions,
} from 'react-native'
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G, Ellipse } from 'react-native-svg'
import { supabase } from '../api/supabase'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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
  if (score <= 20) return { stage: 'seed', state: 'Seed', message: 'Your journey is just beginning' }
  if (score <= 40) return { stage: 'sprout', state: 'Sprout', message: "You're starting to grow" }
  if (score <= 60) return { stage: 'growing', state: 'Growing', message: 'Your balance is developing' }
  if (score <= 80) return { stage: 'blooming', state: 'Blooming', message: "You're becoming more stable" }
  return { stage: 'thriving', state: 'Thriving', message: "You're in a great place" }
}

// SVG plant component with 5 growth stages
const PlantSVG = ({ stage, pulseAnim }: { stage: string; pulseAnim: Animated.Value }) => {
  const colors = {
    seed: { trunk: '#8B6A4F', leaf: '#A5D6A7', soil: '#C8A882' },
    sprout: { trunk: '#6D9B3A', leaf: '#81C784', soil: '#A5C878' },
    growing: { trunk: '#4CAF50', leaf: '#66BB6A', soil: '#8BC34A' },
    blooming: { trunk: '#43A047', leaf: '#4DB6AC', soil: '#80CBC4' },
    thriving: { trunk: '#388E3C', leaf: '#4DB6AC', soil: '#80CBC4' },
  }
  const c = colors[stage as keyof typeof colors] || colors.growing

  if (stage === 'seed') {
    return (
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Defs>
          <LinearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={c.soil} />
            <Stop offset="100%" stopColor="#A0784A" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={36} cy={54} rx={22} ry={8} fill="url(#soilGrad)" />
        <Ellipse cx={36} cy={42} rx={12} ry={11} fill={c.trunk} />
        <Ellipse cx={36} cy={40} rx={9} ry={8} fill={c.leaf} opacity={0.85} />
      </Svg>
    )
  }

  if (stage === 'sprout') {
    return (
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Defs>
          <LinearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={c.leaf} />
            <Stop offset="100%" stopColor="#A5D6A7" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={36} cy={58} rx={20} ry={7} fill={c.soil} opacity={0.6} />
        <Path d="M36 52 L36 30" stroke={c.trunk} strokeWidth={3} strokeLinecap="round" />
        <Ellipse cx={28} cy={34} rx={9} ry={7} fill="url(#leafGrad)" transform="rotate(-25 28 34)" />
        <Ellipse cx={44} cy={34} rx={9} ry={7} fill="url(#leafGrad)" transform="rotate(25 44 34)" />
      </Svg>
    )
  }

  if (stage === 'growing') {
    return (
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Defs>
          <LinearGradient id="lGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#81C784" />
            <Stop offset="100%" stopColor={c.leaf} />
          </LinearGradient>
        </Defs>
        <Ellipse cx={36} cy={61} rx={20} ry={6} fill={c.soil} opacity={0.5} />
        <Path d="M36 58 L36 28" stroke={c.trunk} strokeWidth={3.5} strokeLinecap="round" />
        <Path d="M36 44 Q26 36 20 30" stroke={c.trunk} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Path d="M36 44 Q46 36 52 30" stroke={c.trunk} strokeWidth={2.5} strokeLinecap="round" fill="none" />
        <Ellipse cx={18} cy={27} rx={11} ry={8} fill="url(#lGrad)" transform="rotate(-20 18 27)" />
        <Ellipse cx={54} cy={27} rx={11} ry={8} fill="url(#lGrad)" transform="rotate(20 54 27)" />
        <Ellipse cx={36} cy={22} rx={10} ry={8} fill="url(#lGrad)" />
      </Svg>
    )
  }

  if (stage === 'blooming') {
    return (
      <Svg width={72} height={72} viewBox="0 0 72 72">
        <Defs>
          <LinearGradient id="bGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#80CBC4" />
            <Stop offset="100%" stopColor="#4DB6AC" />
          </LinearGradient>
          <LinearGradient id="flGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F8BBD0" />
            <Stop offset="100%" stopColor="#F48FB1" stopOpacity="0.6" />
          </LinearGradient>
        </Defs>
        <Ellipse cx={36} cy={62} rx={20} ry={5} fill={c.soil} opacity={0.45} />
        <Path d="M36 60 L36 26" stroke={c.trunk} strokeWidth={4} strokeLinecap="round" />
        <Path d="M36 42 Q22 32 14 24" stroke={c.trunk} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Path d="M36 42 Q50 32 58 24" stroke={c.trunk} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Ellipse cx={12} cy={20} rx={12} ry={9} fill="url(#bGrad)" transform="rotate(-20 12 20)" />
        <Ellipse cx={60} cy={20} rx={12} ry={9} fill="url(#bGrad)" transform="rotate(20 60 20)" />
        <Ellipse cx={36} cy={18} rx={12} ry={9} fill="url(#bGrad)" />
        <Circle cx={36} cy={14} r={5} fill="url(#flGrad)" opacity={0.9} />
        <Circle cx={28} cy={16} r={3.5} fill="url(#flGrad)" opacity={0.8} />
        <Circle cx={44} cy={16} r={3.5} fill="url(#flGrad)" opacity={0.8} />
      </Svg>
    )
  }

  // thriving
  return (
    <Svg width={72} height={72} viewBox="0 0 72 72">
      <Defs>
        <LinearGradient id="tGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#80CBC4" />
          <Stop offset="100%" stopColor="#26A69A" />
        </LinearGradient>
        <LinearGradient id="flGrad2" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#F8BBD0" />
          <Stop offset="100%" stopColor="#F48FB1" stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      <Ellipse cx={36} cy={64} rx={20} ry={5} fill={c.soil} opacity={0.4} />
      <Path d="M36 62 L36 22" stroke={c.trunk} strokeWidth={5} strokeLinecap="round" />
      <Path d="M36 48 Q18 36 8 22" stroke={c.trunk} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M36 48 Q54 36 64 22" stroke={c.trunk} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Path d="M36 34 Q24 26 18 16" stroke={c.trunk} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Path d="M36 34 Q48 26 54 16" stroke={c.trunk} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Ellipse cx={6} cy={18} rx={12} ry={9} fill="url(#tGrad)" transform="rotate(-25 6 18)" />
      <Ellipse cx={66} cy={18} rx={12} ry={9} fill="url(#tGrad)" transform="rotate(25 66 18)" />
      <Ellipse cx={16} cy={11} rx={10} ry={7} fill="url(#tGrad)" transform="rotate(-15 16 11)" />
      <Ellipse cx={56} cy={11} rx={10} ry={7} fill="url(#tGrad)" transform="rotate(15 56 11)" />
      <Ellipse cx={36} cy={16} rx={12} ry={9} fill="url(#tGrad)" />
      <Circle cx={36} cy={10} r={5} fill="url(#flGrad2)" />
      <Circle cx={27} cy={13} r={3.5} fill="url(#flGrad2)" opacity={0.85} />
      <Circle cx={45} cy={13} r={3.5} fill="url(#flGrad2)" opacity={0.85} />
    </Svg>
  )
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
    route.params?.balanceStart || 30
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
      { id: 'drawing', label: 'Drawing', emoji: '✏️' },
      { id: 'painting', label: 'Painting', emoji: '🎨' },
      { id: 'photography', label: 'Photography', emoji: '📷' },
      { id: 'writing', label: 'Writing', emoji: '✍️' },
      { id: 'crafts', label: 'Crafts', emoji: '🧶' },
      { id: 'digital_art', label: 'Digital Art', emoji: '💻' },
      { id: 'listening_music', label: 'Listening to Music', emoji: '🎧' },
      { id: 'singing', label: 'Singing', emoji: '🎤' },
      { id: 'playing_instruments', label: 'Playing Instruments', emoji: '🎸' },
      { id: 'making_playlists', label: 'Making Playlists', emoji: '🎶' },
      { id: 'reading', label: 'Reading', emoji: '📖' },
      { id: 'documentaries', label: 'Documentaries', emoji: '🎬' },
      { id: 'new_skills', label: 'Learning New Skills', emoji: '🧠' },
      { id: 'languages', label: 'Language Learning', emoji: '🌍' },
      { id: 'walking', label: 'Walking', emoji: '🚶' },
      { id: 'swimming', label: 'Swimming', emoji: '🏊' },
      { id: 'cycling', label: 'Cycling', emoji: '🚴' },
      { id: 'stretching', label: 'Stretching', emoji: '🧘' },
      { id: 'dancing', label: 'Dancing', emoji: '💃' },
      { id: 'gaming', label: 'Gaming', emoji: '🎮' },
      { id: 'anime', label: 'Anime', emoji: '✨' },
      { id: 'movies', label: 'Movies', emoji: '🎥' },
      { id: 'tv_shows', label: 'TV Shows', emoji: '📺' },
      { id: 'podcasts', label: 'Podcasts', emoji: '🎙️' },
      { id: 'nature', label: 'Nature', emoji: '🌿' },
      { id: 'gardening', label: 'Gardening', emoji: '🌱' },
      { id: 'meditation', label: 'Meditation', emoji: '🧘' },
      { id: 'breathing', label: 'Breathing Exercises', emoji: '🌬️' },
      { id: 'friends', label: 'Talking with Friends', emoji: '👯' },
      { id: 'family', label: 'Family Time', emoji: '👨‍👩‍👧' },
      { id: 'group_activities', label: 'Group Activities', emoji: '🎉' },
    ]
    const selected = allItems.filter(i => data.balance_boosters.includes(i.id))
    if (selected.length > 0) {
      const sorted = selected.sort((a, b) => a.id.localeCompare(b.id))
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
      console.log('Home booster:', sorted[dayOfYear % sorted.length]?.id, 'day:', dayOfYear, 'pool:', sorted.map(i => i.id))
      setTodayBooster(sorted[dayOfYear % sorted.length])
    }
  }
}
const { data: studentData } = await supabase
.from('student_profiles')
.select('check_in_streak, balance_index')
.eq('id', user.id)
.single()
if (studentData?.check_in_streak) {
setStreak(studentData.check_in_streak)
}
if (studentData?.balance_index) {
setBalanceIndex(studentData.balance_index)
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

  const QUICK_ACTIONS = [
    { bg: '#E8F8F6', icon: '📋', title: 'Daily Check-in', subtitle: 'Log how you feel', screen: 'CheckIn', onPress: () => { showWin('You checked in with yourself today'); navigation.navigate('CheckIn') } },
    { bg: '#EDE9FF', icon: '🔒', title: 'Journal Vault', subtitle: 'Private to you', screen: 'Journal', onPress: () => navigation.navigate('Journal') },
    { bg: '#FFF3E8', icon: '🧠', title: 'CBT Tools', subtitle: 'Learn and grow', screen: 'CBT', onPress: () => navigation.navigate('CBT') },
    { bg: '#F0F8FF', icon: '🌿', title: 'Coping Toolkit', subtitle: 'Feel better now', screen: 'Coping', onPress: () => navigation.navigate('Coping') },
    { bg: '#EDE9FF', icon: '🪞', title: 'A Space for You', subtitle: 'Self-worth reflections', screen: 'SelfWorthHub', onPress: () => navigation.navigate('SelfWorthHub') },
  ]

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
          <Text style={styles.microWinIcon}>✨</Text>
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
            <View style={styles.balanceCardInner}>
              <View style={styles.balanceTextSection}>
                <Text style={styles.balanceLabel}>Balance Tree</Text>
                <Text style={styles.balanceSubLabel}>{organism.message}</Text>
                <View style={styles.stageChip}>
                  <Text style={styles.stageChipText}>{organism.state}</Text>
                </View>
              </View>
              <Animated.View
                style={[
                  styles.plantContainer,
                  {
                    transform: [
                      { scale: plantScale },
                      { scale: plantPulse },
                    ],
                  },
                ]}
              >
                <PlantSVG stage={organism.stage} pulseAnim={plantPulse} />
              </Animated.View>
            </View>

            <View style={styles.balanceBarTrack}>
              <Animated.View
                style={[
                  styles.balanceFill,
                  {
                    width: `${balanceIndex}%` as any,
                    backgroundColor: getBalanceColor(),
                  },
                ]}
              />
            </View>

            <View style={styles.balanceFooter}>
              <View style={styles.balanceScoreRow}>
                <View style={[styles.balanceDot, { backgroundColor: getBalanceColor() }]} />
                <Text style={[styles.balanceScore, { color: getBalanceColor() }]}>
                  {balanceIndex} / 100
                </Text>
              </View>
              <Text style={styles.balanceHint}>Grows with each check-in</Text>
            </View>
          </View>

          {/* Streak + Reflection row */}
          <View style={styles.rowCards}>
            <View style={styles.streakCard}>
              <View style={styles.streakIconWrap}>
                <Text style={styles.streakEmoji}>🔥</Text>
              </View>
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
                <Text style={styles.reflectionButtonText}>Reflect →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick actions */}
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.actionCard, { backgroundColor: action.bg }]}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Balance Boosters banner — shown if not set up */}
          {!boostersSetupDone && (
            <TouchableOpacity
              style={styles.boostersBanner}
              onPress={() => navigation.navigate('BalanceBoosters', { isSetup: true })}
              activeOpacity={0.85}
            >
              <View style={styles.boostersBannerIconWrap}>
                <Text style={styles.boostersBannerEmoji}>🌿</Text>
              </View>
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
                <View>
                  <Text style={styles.boosterCardName}>{todayBooster.label}</Text>
                  <Text style={styles.boosterCardHint}>Tap to explore →</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

           {/* Reality Check card — shown if social media or body image selected */}
           {moodTriggers.length > 0 && (
  <View style={styles.realityCard}>
    <Text style={styles.realityCardLabel}>
      {moodTriggers.includes('social_media') ? 'Reality Check' :
       moodTriggers.includes('school') ? 'School Pressure' :
       moodTriggers.includes('friendships') ? 'Friendships' :
       moodTriggers.includes('family') ? 'Family' :
       moodTriggers.includes('body_image') ? 'Self Worth' :
       moodTriggers.includes('future') ? 'Future Worries' :
       'Mood Check'}
    </Text>
    <Text style={styles.realityCardText}>
      {moodTriggers.includes('social_media') ? [
        "People often share their best moments online — not their everyday struggles.",
        "Your progress doesn't need to look like someone else's.",
        "What you see online is a highlight reel, not the full story.",
      ][realityCardIndex % 3] :
      moodTriggers.includes('school') ? [
        "Academic pressure is real. You are doing your best.",
        "Difficult periods at school are temporary. They do not define you.",
        "It is okay to take things one step at a time.",
      ][realityCardIndex % 3] :
      moodTriggers.includes('friendships') ? [
        "It is okay if relationships feel complicated right now.",
        "You deserve friendships that feel safe and genuine.",
        "Connections change and grow over time. That is normal.",
      ][realityCardIndex % 3] :
      moodTriggers.includes('family') ? [
        "Family dynamics can affect us in deep ways. What you feel is valid.",
        "It is okay to find family situations complicated.",
        "You do not have to have it all figured out.",
      ][realityCardIndex % 3] :
      moodTriggers.includes('body_image') ? [
        "Your worth is not defined by how you look.",
        "How we see ourselves is often shaped by comparison and stress — not reality.",
        "You deserve kindness — especially from yourself.",
      ][realityCardIndex % 3] :
      moodTriggers.includes('future') ? [
        "You do not have to have everything figured out right now.",
        "Taking things one day at a time is always enough.",
        "Worry about the future is something almost everyone feels.",
      ][realityCardIndex % 3] : [
        "It makes sense that things feel heavy when so much is happening at once.",
        "You do not have to address everything at the same time.",
        "Small steps forward still count.",
      ][realityCardIndex % 3]}
    </Text>
    <View style={styles.realityCardActions}>
      <TouchableOpacity
        onPress={() => setRealityCardIndex(realityCardIndex + 1)}
        style={styles.realityCardNext}
      >
        <Text style={styles.realityCardNextText}>Next →</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('TriggerAwareness')}
        style={styles.realityCardExplore}
      >
        <Text style={styles.realityCardExploreText}>Explore →</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

          {/* Emotional continuity */}
          <View style={styles.continuityCard}>
            <Text style={styles.continuityIcon}>🌱</Text>
            <Text style={styles.continuityText}>
              Keep checking in daily — your Balance Tree grows with every visit.
            </Text>
          </View>

          {/* Privacy reminder */}
          <View style={styles.privacyReminder}>
            <Text style={styles.privacyText}>
              🔒 Your check-ins and journal are always private to you
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
          <View style={styles.navActiveIndicator} />
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
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
  },
  microWin: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: '#2E3A59',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#2E3A59',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  microWinIcon: { fontSize: 16 },
  microWinText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 52,
  },
  greeting: {
    fontSize: 13,
    color: '#9BA3B0',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E3A59',
    letterSpacing: -0.3,
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4DB6AC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  // Balance card
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  balanceCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  balanceTextSection: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  balanceSubLabel: {
    fontSize: 13,
    color: '#9BA3B0',
    lineHeight: 18,
    marginBottom: 10,
  },
  stageChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F8F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  stageChipText: {
    fontSize: 12,
    color: '#4DB6AC',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  plantContainer: {
    marginLeft: 12,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceBarTrack: {
    height: 10,
    backgroundColor: '#F0F5F4',
    borderRadius: 5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  balanceFill: {
    height: '100%',
    borderRadius: 5,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  balanceScore: {
    fontSize: 14,
    fontWeight: '700',
  },
  balanceHint: {
    fontSize: 11,
    color: '#C0C8D0',
    letterSpacing: 0.2,
  },
  // Row cards
  rowCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  streakCard: {
    backgroundColor: '#FFF8E8',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 84,
    shadowColor: '#F0A500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  streakIconWrap: {
    marginBottom: 6,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    letterSpacing: -0.5,
  },
  streakLabel: {
    fontSize: 10,
    color: '#B8A070',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 2,
  },
  reflectionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  reflectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B39DDB',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 7,
  },
  reflectionPrompt: {
    fontSize: 13,
    color: '#2E3A59',
    lineHeight: 19,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  reflectionButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDE9FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  reflectionButtonText: {
    fontSize: 12,
    color: '#B39DDB',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    width: '47%',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 3,
    letterSpacing: -0.1,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#9BA3B0',
    lineHeight: 15,
  },
  continuityCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#C8EFEC',
  },
  continuityIcon: { fontSize: 18 },
  continuityText: {
    fontSize: 12,
    color: '#4DB6AC',
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  privacyReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
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
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    position: 'relative',
  },
  navActiveIndicator: {
    position: 'absolute',
    top: -10,
    width: 28,
    height: 2.5,
    backgroundColor: '#4DB6AC',
    borderRadius: 2,
  },
  navIcon: {
    fontSize: 22,
    opacity: 0.35,
  },
  navIconActive: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 10,
    color: '#9BA3B0',
    fontWeight: '500',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#4DB6AC',
    fontWeight: '700',
  },
  boostersBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  boostersBannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F8F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostersBannerEmoji: { fontSize: 22 },
  boostersBannerText: { flex: 1 },
  boostersBannerTitle: { fontSize: 14, fontWeight: '700', color: '#2E3A59', marginBottom: 2 },
  boostersBannerSubtitle: { fontSize: 12, color: '#4DB6AC', fontWeight: '500' },
  boosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
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
    fontSize: 10,
    color: '#4DB6AC',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  boosterCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  boosterCardEmoji: { fontSize: 32 },
  boosterCardName: { fontSize: 17, fontWeight: '700', color: '#2E3A59', marginBottom: 3 },
  boosterCardHint: { fontSize: 12, color: '#9BA3B0' },
  realityCard: {
    backgroundColor: '#EDE9FF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
  },
  realityCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B39DDB',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  realityCardText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  realityCardNext: {
    alignSelf: 'flex-end',
    backgroundColor: '#D9D0F8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  realityCardNextText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  floatingGuideButton: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2E3A59',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E3A59',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 100,
  },
  floatingGuideEmoji: { fontSize: 24 },
  realityCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  realityCardExplore: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E8F8F6',
  },
  realityCardExploreText: {
    fontSize: 12,
    color: '#4DB6AC',
    fontWeight: '600',
  },
})
