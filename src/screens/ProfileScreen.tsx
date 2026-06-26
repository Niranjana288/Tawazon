import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native'
import { supabase } from '../api/supabase'

const BADGES = [
  { id: 'first_checkin', label: 'First Check-in', description: 'Completed your first check-in', emoji: '🌱', requirement: 1 },
  { id: 'streak_7', label: '7 Day Streak', description: 'Checked in 7 days in a row', emoji: '🔥', requirement: 7 },
  { id: 'streak_14', label: '2 Week Streak', description: 'Checked in 14 days in a row', emoji: '🌿', requirement: 14 },
  { id: 'streak_30', label: '30 Day Streak', description: 'Checked in 30 days in a row', emoji: '🌳', requirement: 30 },
  { id: 'journal_1', label: 'First Journal', description: 'Wrote your first journal entry', emoji: '📔', requirement: 1 },
  { id: 'cbt_complete', label: 'CBT Explorer', description: 'Completed a CBT module', emoji: '🧠', requirement: 1 },
]

export default function ProfileScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const [userName, setUserName] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [streak, setStreak] = useState(0)
  const [journalCount, setJournalCount] = useState(0)
  const [checkInCount, setCheckInCount] = useState(0)
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

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
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAgeRange(user.user_metadata?.age_range || '18plus')

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile?.full_name) setUserName(profile.full_name)

        const { data: studentProfile } = await supabase
          .from('student_profiles')
          .select('check_in_streak')
          .eq('id', user.id)
          .single()
        if (studentProfile?.check_in_streak) {
          setStreak(studentProfile.check_in_streak)
        }

        const { count: journalC } = await supabase
          .from('journal_entries')
          .select('id', { count: 'exact' })
          .eq('student_id', user.id)
          .eq('is_deleted', false)
        setJournalCount(journalC || 0)

        const { count: checkInC } = await supabase
          .from('daily_checkins')
          .select('id', { count: 'exact' })
          .eq('student_id', user.id)
        setCheckInCount(checkInC || 0)
      }
    } catch (e) {
      console.log('Profile error:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigation.reset({
      index: 0,
      routes: [{ name: 'Splash' }],
    })
  }

  const getEarnedBadges = () => {
    const earned = []
    if (checkInCount >= 1) earned.push('first_checkin')
    if (streak >= 7) earned.push('streak_7')
    if (streak >= 14) earned.push('streak_14')
    if (streak >= 30) earned.push('streak_30')
    if (journalCount >= 1) earned.push('journal_1')
    return earned
  }

  const earnedBadges = getEarnedBadges()

  const getAgeRangeLabel = () => {
    if (ageRange === 'under13') return 'Under 13'
    if (ageRange === '13to17') return '13 - 17'
    return '18+'
  }

  const getInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : '?'
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Avatar + name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{getInitial()}</Text>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.ageRange}>{getAgeRangeLabel()}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{streak}</Text>
              <Text style={styles.statLabel}>Day streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{checkInCount}</Text>
              <Text style={styles.statLabel}>Check-ins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{journalCount}</Text>
              <Text style={styles.statLabel}>Journal entries</Text>
            </View>
          </View>

          {/* Badges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Badges</Text>
            <View style={styles.badgesGrid}>
              {BADGES.map((badge) => {
                const earned = earnedBadges.includes(badge.id)
                return (
                  <View
                    key={badge.id}
                    style={[
                      styles.badgeCard,
                      !earned && styles.badgeCardLocked,
                    ]}
                  >
                    <Text style={[
                      styles.badgeEmoji,
                      !earned && styles.badgeEmojiLocked,
                    ]}>
                      {earned ? badge.emoji : '🔒'}
                    </Text>
                    <Text style={[
                      styles.badgeLabel,
                      !earned && styles.badgeLabelLocked,
                    ]}>
                      {badge.label}
                    </Text>
                    <Text style={styles.badgeDescription}>
                      {earned ? badge.description : 'Keep going!'}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Language */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Language</Text>
            <View style={styles.settingCard}>
              <View style={styles.langRow}>
                <TouchableOpacity
                  style={[
                    styles.langBtn,
                    language === 'en' && styles.langBtnActive,
                  ]}
                  onPress={() => setLanguage('en')}
                >
                  <Text style={[
                    styles.langBtnText,
                    language === 'en' && styles.langBtnTextActive,
                  ]}>
                    English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.langBtn,
                    language === 'ar' && styles.langBtnActive,
                  ]}
                  onPress={() => setLanguage('ar')}
                >
                  <Text style={[
                    styles.langBtnText,
                    language === 'ar' && styles.langBtnTextActive,
                  ]}>
                    العربية
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Privacy settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Daily reminders</Text>
                  <Text style={styles.settingSubLabel}>Get a gentle nudge to check in</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#E8ECF0', true: '#4DB6AC' }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>

            <View style={styles.privacyInfoCard}>
              <Text style={styles.privacyInfoTitle}>What is private</Text>
              <Text style={styles.privacyInfoItem}>Your journal entries are never shared</Text>
              <Text style={styles.privacyInfoItem}>Your check-in notes are private to you</Text>
              <Text style={styles.privacyInfoItem}>Parents see summaries only</Text>
              <Text style={styles.privacyInfoItem}>Your data is stored securely</Text>
            </View>
          </View>

          {/* Sign out */}
          {ageRange !== '18plus' && (
          <TouchableOpacity
            style={styles.linkParentButton}
            onPress={() => navigation.navigate('LinkParent')}
            activeOpacity={0.85}
          >
            <Text style={styles.linkParentText}>Link to parent</Text>
          </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('SupportCenter')}
            activeOpacity={0.85}
          >
            <Text style={styles.supportButtonText}>🌿 Support Center</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => navigation.navigate('Help')}
            activeOpacity={0.85}
          >
          <Text style={styles.supportButtonText}>❓ Help & FAQs</Text>
          </TouchableOpacity>
          <TouchableOpacity
           style={styles.rahaPolicyButton}
           onPress={() => navigation.navigate('RAHAPolicy')}
            activeOpacity={0.85}
          >
          <Text style={styles.rahaPolicyButtonText}>
            🌿 RAHA Policy
          </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.85}
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Tawazon · Balance. Heal. Thrive.</Text>

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
    padding: 24,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4DB6AC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  ageRange: {
    fontSize: 13,
    color: '#9BA3B0',
  },
  statsRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BA3B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  badgeCardLocked: {
    borderColor: '#E8ECF0',
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  badgeEmojiLocked: {
    opacity: 0.4,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeLabelLocked: {
    color: '#9BA3B0',
  },
  badgeDescription: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 10,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  langBtnActive: {
    backgroundColor: '#4DB6AC',
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9BA3B0',
  },
  langBtnTextActive: {
    color: '#ffffff',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E3A59',
    marginBottom: 2,
  },
  settingSubLabel: {
    fontSize: 12,
    color: '#9BA3B0',
  },
  privacyInfoCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  privacyInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 10,
  },
  privacyInfoItem: {
    fontSize: 12,
    color: '#4DB6AC',
    marginBottom: 6,
    paddingLeft: 8,
    lineHeight: 18,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    marginBottom: 16,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E05555',
  },
  versionText: {
    fontSize: 12,
    color: '#C0C8D0',
    textAlign: 'center',
  },
  linkParentButton: {
    backgroundColor: '#E8F8F6',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  linkParentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4DB6AC',
  },
  supportButton: {
    backgroundColor: '#F0FAFA',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  supportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4DB6AC',
  },
  rahaPolicyButton: {
    backgroundColor: '#E8F8F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  rahaPolicyButtonText: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '600',
  },
})