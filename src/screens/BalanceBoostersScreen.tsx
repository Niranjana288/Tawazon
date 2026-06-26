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

const CATEGORIES = [
  {
    id: 'creative',
    label: 'Creative',
    emoji: '🎨',
    color: '#FCE8F0',
    borderColor: '#F48FB1',
    items: [
      { id: 'drawing', label: 'Drawing', emoji: '✏️' },
      { id: 'painting', label: 'Painting', emoji: '🎨' },
      { id: 'photography', label: 'Photography', emoji: '📷' },
      { id: 'writing', label: 'Writing', emoji: '✍️' },
      { id: 'crafts', label: 'Crafts', emoji: '🧶' },
      { id: 'digital_art', label: 'Digital Art', emoji: '💻' },
    ],
  },
  {
    id: 'music',
    label: 'Music',
    emoji: '🎵',
    color: '#EDE9FF',
    borderColor: '#B39DDB',
    items: [
      { id: 'listening_music', label: 'Listening to Music', emoji: '🎧' },
      { id: 'singing', label: 'Singing', emoji: '🎤' },
      { id: 'playing_instruments', label: 'Playing Instruments', emoji: '🎸' },
      { id: 'making_playlists', label: 'Making Playlists', emoji: '🎶' },
    ],
  },
  {
    id: 'learning',
    label: 'Learning',
    emoji: '📚',
    color: '#FFF3E8',
    borderColor: '#F0A500',
    items: [
      { id: 'reading', label: 'Reading', emoji: '📖' },
      { id: 'documentaries', label: 'Documentaries', emoji: '🎬' },
      { id: 'new_skills', label: 'Learning New Skills', emoji: '🧠' },
      { id: 'languages', label: 'Language Learning', emoji: '🌍' },
    ],
  },
  {
    id: 'movement',
    label: 'Movement',
    emoji: '🚶',
    color: '#E8F8F6',
    borderColor: '#4DB6AC',
    items: [
      { id: 'walking', label: 'Walking', emoji: '🚶' },
      { id: 'swimming', label: 'Swimming', emoji: '🏊' },
      { id: 'cycling', label: 'Cycling', emoji: '🚴' },
      { id: 'stretching', label: 'Stretching', emoji: '🧘' },
      { id: 'dancing', label: 'Dancing', emoji: '💃' },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    emoji: '🎮',
    color: '#E6F1FB',
    borderColor: '#4A90D9',
    items: [
      { id: 'gaming', label: 'Gaming', emoji: '🎮' },
      { id: 'anime', label: 'Anime', emoji: '✨' },
      { id: 'movies', label: 'Movies', emoji: '🎥' },
      { id: 'tv_shows', label: 'TV Shows', emoji: '📺' },
      { id: 'podcasts', label: 'Podcasts', emoji: '🎙️' },
    ],
  },
  {
    id: 'relaxation',
    label: 'Relaxation',
    emoji: '🌿',
    color: '#E8F8F6',
    borderColor: '#4DB6AC',
    items: [
      { id: 'nature', label: 'Nature', emoji: '🌿' },
      { id: 'gardening', label: 'Gardening', emoji: '🌱' },
      { id: 'meditation', label: 'Meditation', emoji: '🧘' },
      { id: 'breathing', label: 'Breathing Exercises', emoji: '🌬️' },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    emoji: '👥',
    color: '#FFF8E8',
    borderColor: '#F0A500',
    items: [
      { id: 'friends', label: 'Talking with Friends', emoji: '👯' },
      { id: 'family', label: 'Family Time', emoji: '👨‍👩‍👧' },
      { id: 'group_activities', label: 'Group Activities', emoji: '🎉' },
    ],
  },
]

const ALL_ITEMS = CATEGORIES.flatMap(c => c.items.map(i => ({ ...i, category: c.id })))

const getRecommendation = (
  selectedIds: string[],
  moodScore: number,
  stressScore: number,
) => {
  const selected = ALL_ITEMS.filter(i => selectedIds.includes(i.id))
  if (selected.length === 0) return null

  let pool = selected

  if (moodScore <= 2) {
    const preferred = pool.filter(i =>
      ['listening_music', 'drawing', 'painting', 'reading', 'tv_shows', 'movies', 'anime'].includes(i.id)
    )
    if (preferred.length > 0) pool = preferred
  } else if (stressScore >= 4) {
    const preferred = pool.filter(i =>
      ['walking', 'breathing', 'stretching', 'nature', 'meditation'].includes(i.id)
    )
    if (preferred.length > 0) pool = preferred
  }

  return pool[Math.floor(Math.random() * pool.length)]
}

const getBoosterMessage = (itemId: string, moodScore: number, stressScore: number) => {
  if (moodScore <= 2) {
    return "You've seemed a little low lately. Something small and comforting might help you reset."
  }
  if (stressScore >= 4) {
    return "You've been under some pressure. A short break with something you enjoy might help."
  }
  return "A little time with something you love can go a long way toward balance."
}

const getBoosterDuration = (itemId: string) => {
  const durations: Record<string, string> = {
    listening_music: '5 minutes',
    drawing: '10 minutes',
    painting: '15 minutes',
    walking: '10 minutes',
    breathing: '3 minutes',
    stretching: '5 minutes',
    reading: '15 minutes',
    meditation: '5 minutes',
    gaming: '20 minutes',
    writing: '10 minutes',
    photography: '10 minutes',
    nature: '10 minutes',
    singing: '5 minutes',
    dancing: '5 minutes',
    movies: '30 minutes',
    tv_shows: '20 minutes',
    anime: '20 minutes',
    podcasts: '15 minutes',
    family: '15 minutes',
    friends: '10 minutes',
    crafts: '15 minutes',
    digital_art: '15 minutes',
    cycling: '20 minutes',
    swimming: '30 minutes',
    gardening: '15 minutes',
    new_skills: '15 minutes',
    languages: '10 minutes',
    documentaries: '20 minutes',
    group_activities: '30 minutes',
    making_playlists: '10 minutes',
    playing_instruments: '15 minutes',
  }
  return durations[itemId] || '10 minutes'
}

export default function BalanceBoostersScreen({ navigation, route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const isSetup = route.params?.isSetup || false
  const moodScore = route.params?.moodScore || 3
  const stressScore = route.params?.stressScore || 2

  const [selected, setSelected] = useState<string[]>([])
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [saving, setSaving] = useState(false)
  const [setupDone, setSetupDone] = useState(false)
  const [recommendation, setRecommendation] = useState<any>(null)
  const [skippedToday, setSkippedToday] = useState(false)
  const [completedToday, setCompletedToday] = useState(false)
  const successAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()
    fetchExisting()
  }, [])

  const fetchExisting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('balance_boosters, boosters_setup_done')
        .eq('id', user.id)
        .single()
      if (data?.balance_boosters?.length > 0) {
        setSelected(data.balance_boosters)
        setSetupDone(data.boosters_setup_done || false)
        if (data.boosters_setup_done && !isSetup) {
          const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
          const pool = ALL_ITEMS.filter(i => data.balance_boosters.includes(i.id))
          if (pool.length > 0) {
            const sorted = pool.sort((a, b) => a.id.localeCompare(b.id))
            console.log('Booster screen:', sorted[dayOfYear % sorted.length]?.id, 'day:', dayOfYear, 'pool:', sorted.map(i => i.id))
            setRecommendation(sorted[dayOfYear % sorted.length])
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }

  const toggleItem = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    if (selected.length === 0) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('profiles')
        .update({
          balance_boosters: selected,
          boosters_setup_done: true,
        })
        .eq('id', user.id)
      const rec = getRecommendation(selected, moodScore, stressScore)
      setRecommendation(rec)
      setSetupDone(true)
    } catch (e) {
      console.log(e)
    } finally {
      setSaving(false)
    }
  }

  const handleHelped = () => {
    setCompletedToday(true)
    Animated.sequence([
      Animated.timing(successAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(successAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()
  }

  const handleNotToday = () => {
    setSkippedToday(true)
  }

  const handleShowAnother = () => {
    const rec = getRecommendation(selected, moodScore, stressScore)
    setRecommendation(rec)
  }

  // Setup screen
  if (isSetup || !setupDone) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Balance Boosters</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.setupTitle}>What helps you feel like yourself?</Text>
            <Text style={styles.setupSubtitle}>
              Select activities that bring you comfort, joy, or balance. Tawazon will suggest them when you need a reset.
            </Text>

            {CATEGORIES.map(category => (
              <View key={category.id} style={styles.categorySection}>
                <Text style={styles.categoryTitle}>
                  {category.emoji} {category.label}
                </Text>
                <View style={styles.itemsGrid}>
                  {category.items.map(item => {
                    const isSelected = selected.includes(item.id)
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.itemChip,
                          { borderColor: isSelected ? category.borderColor : '#E8ECF0' },
                          isSelected && { backgroundColor: category.color },
                        ]}
                        onPress={() => toggleItem(item.id)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.itemEmoji}>{item.emoji}</Text>
                        <Text style={[
                          styles.itemLabel,
                          isSelected && { color: '#2E3A59', fontWeight: '600' },
                        ]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            ))}

            {/* Custom input */}
            <View style={styles.categorySection}>
              <Text style={styles.categoryTitle}>✨ Other</Text>
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => setShowCustom(!showCustom)}
              >
                <Text style={styles.addCustomText}>+ Add your own</Text>
              </TouchableOpacity>
              {showCustom && (
                <View style={styles.customInputRow}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="e.g. Baking, Journaling..."
                    placeholderTextColor="#C0C8D0"
                    value={customInput}
                    onChangeText={setCustomInput}
                  />
                  <TouchableOpacity
                    style={styles.customAddBtn}
                    onPress={() => {
                      if (customInput.trim()) {
                        const id = `custom_${customInput.trim().toLowerCase().replace(/\s/g, '_')}`
                        setSelected(prev => [...prev, id])
                        setCustomInput('')
                        setShowCustom(false)
                      }
                    }}
                  >
                    <Text style={styles.customAddBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Selected count */}
            {selected.length > 0 && (
              <View style={styles.selectedCount}>
                <Text style={styles.selectedCountText}>
                  {selected.length} activit{selected.length === 1 ? 'y' : 'ies'} selected
                </Text>
              </View>
            )}

            {/* Save button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                selected.length === 0 && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={selected.length === 0 || saving}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save my boosters'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipSetupButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.skipSetupText}>I'll do this later</Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </View>
    )
  }

  // Recommendation screen (after setup)
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Balance Boosters</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('BalanceBoosters', { isSetup: true })}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Success animation */}
          <Animated.View style={[styles.successBanner, { opacity: successAnim }]}>
            <Text style={styles.successText}>🌱 That's wonderful. Your balance tree is growing.</Text>
          </Animated.View>

          {/* Today's booster */}
          {recommendation && !skippedToday && !completedToday && (
            <View style={styles.boosterCard}>
              <Text style={styles.boosterCardTitle}>Something small that might help today</Text>
              <View style={styles.boosterMain}>
                <Text style={styles.boosterEmoji}>{recommendation.emoji}</Text>
                <View style={styles.boosterInfo}>
                  <Text style={styles.boosterName}>{recommendation.label}</Text>
                  <Text style={styles.boosterDuration}>{getBoosterDuration(recommendation.id)}</Text>
                </View>
              </View>
              <Text style={styles.boosterMessage}>
                {getBoosterMessage(recommendation.id, moodScore, stressScore)}
              </Text>
              <View style={styles.boosterActions}>
                <TouchableOpacity
                  style={styles.boosterActionHelped}
                  onPress={handleHelped}
                  activeOpacity={0.85}
                >
                  <Text style={styles.boosterActionHelpedText}>👍 Helped</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.boosterActionSkip}
                  onPress={handleNotToday}
                  activeOpacity={0.85}
                >
                  <Text style={styles.boosterActionSkipText}>😐 Not today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.boosterActionAnother}
                  onPress={handleShowAnother}
                  activeOpacity={0.85}
                >
                  <Text style={styles.boosterActionAnotherText}>🔄</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Completed state */}
          {completedToday && (
            <View style={styles.completedCard}>
              <Text style={styles.completedEmoji}>🌿</Text>
              <Text style={styles.completedTitle}>Well done for taking that moment.</Text>
              <Text style={styles.completedSubtitle}>
                Small acts of self-care are what balance is made of.
              </Text>
            </View>
          )}

          {/* Skipped state */}
          {skippedToday && (
            <View style={styles.skippedCard}>
              <Text style={styles.skippedText}>
                No worries. Balance looks different every day.
              </Text>
              <TouchableOpacity
                style={styles.tryAnotherButton}
                onPress={() => {
                  setSkippedToday(false)
                  handleShowAnother()
                }}
              >
                <Text style={styles.tryAnotherText}>Show me another option</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Your boosters */}
          <View style={styles.yourBoostersSection}>
            <Text style={styles.yourBoostersTitle}>Your Balance Boosters</Text>
            <Text style={styles.yourBoostersSubtitle}>
              Activities you've told us help you feel like yourself
            </Text>
            <View style={styles.yourBoostersGrid}>
              {ALL_ITEMS.filter(i => selected.includes(i.id)).map(item => (
                <View key={item.id} style={styles.yourBoosterChip}>
                  <Text style={styles.yourBoosterEmoji}>{item.emoji}</Text>
                  <Text style={styles.yourBoosterLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* No pressure note */}
          <View style={styles.noPressureCard}>
            <Text style={styles.noPressureText}>
              Balance Boosters are gentle suggestions — never obligations. Listening to yourself is always the right choice.
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
  editButton: { width: 40, alignItems: 'flex-end' },
  editButtonText: { fontSize: 14, color: '#4DB6AC', fontWeight: '500' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  setupTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
  },
  setupSubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    lineHeight: 22,
    marginBottom: 24,
  },
  categorySection: { marginBottom: 24 },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    backgroundColor: '#FFFFFF',
  },
  itemEmoji: { fontSize: 14 },
  itemLabel: { fontSize: 13, color: '#9BA3B0' },
  addCustomButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    borderStyle: 'dashed',
    alignSelf: 'flex-start',
  },
  addCustomText: { fontSize: 13, color: '#9BA3B0' },
  customInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2E3A59',
  },
  customAddBtn: {
    backgroundColor: '#4DB6AC',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  customAddBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
  selectedCount: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedCountText: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  skipSetupButton: { alignItems: 'center', paddingVertical: 10 },
  skipSetupText: { fontSize: 13, color: '#9BA3B0' },
  successBanner: {
    backgroundColor: '#2E3A59',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  successText: { color: '#ffffff', fontSize: 14, fontWeight: '500' },
  boosterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#E8F8F6',
  },
  boosterCardTitle: {
    fontSize: 12,
    color: '#9BA3B0',
    fontWeight: '500',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boosterMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  boosterEmoji: { fontSize: 36 },
  boosterInfo: { flex: 1 },
  boosterName: { fontSize: 18, fontWeight: '700', color: '#2E3A59', marginBottom: 4 },
  boosterDuration: { fontSize: 12, color: '#4DB6AC', fontWeight: '500' },
  boosterMessage: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  boosterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  boosterActionHelped: {
    flex: 1,
    backgroundColor: '#E8F8F6',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  boosterActionHelpedText: { fontSize: 13, fontWeight: '600', color: '#4DB6AC' },
  boosterActionSkip: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  boosterActionSkipText: { fontSize: 13, color: '#9BA3B0' },
  boosterActionAnother: {
    width: 40,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  boosterActionAnotherText: { fontSize: 16 },
  completedCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  completedEmoji: { fontSize: 36, marginBottom: 10 },
  completedTitle: { fontSize: 16, fontWeight: '700', color: '#2E3A59', marginBottom: 6, textAlign: 'center' },
  completedSubtitle: { fontSize: 13, color: '#9BA3B0', textAlign: 'center', lineHeight: 20 },
  skippedCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  skippedText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  tryAnotherButton: { paddingVertical: 8 },
  tryAnotherText: { fontSize: 13, color: '#4DB6AC', fontWeight: '500', textDecorationLine: 'underline' },
  yourBoostersSection: { marginBottom: 16 },
  yourBoostersTitle: { fontSize: 15, fontWeight: '700', color: '#2E3A59', marginBottom: 4 },
  yourBoostersSubtitle: { fontSize: 12, color: '#9BA3B0', marginBottom: 14 },
  yourBoostersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yourBoosterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  yourBoosterEmoji: { fontSize: 14 },
  yourBoosterLabel: { fontSize: 12, color: '#2E3A59', fontWeight: '500' },
  noPressureCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
  },
  noPressureText: {
    fontSize: 12,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 18,
  },
})