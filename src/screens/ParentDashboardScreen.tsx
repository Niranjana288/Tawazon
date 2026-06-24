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

export default function ParentDashboardScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const [parentName, setParentName] = useState('')
  const [childName, setChildName] = useState('')
  const [loading, setLoading] = useState(true)
  const [inviteCode, setInviteCode] = useState('')
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false)

  const [balanceStatus, setBalanceStatus] = useState({
    emoji: '🌿',
    label: 'Balanced',
    description: 'Things seem stable this week',
    color: '#E8F8F6',
    borderColor: '#4DB6AC',
  })

  const [trends, setTrends] = useState({
    mood: 'Stable',
    stress: 'Stable',
    sleep: 'Stable',
  })

  const [activity, setActivity] = useState({
    checkIns: 0,
    journals: 0,
    toolkitUses: 0,
    totalDays: 7,
  })

  const [insights, setInsights] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

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
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get parent name
      const { data: parentProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (parentProfile?.full_name) {
        setParentName(parentProfile.full_name.split(' ')[0])
      }

      // Get linked child
      const { data: link } = await supabase
        .from('parent_child_links')
        .select('student_id')
        .eq('parent_id', user.id)
        .eq('status', 'active')
        .single()
      const { data: inviteData } = await supabase
        .from('parent_child_links')
        .select('invite_code')
        .eq('parent_id', user.id)
        .single()
      if (inviteData?.invite_code) {
        setInviteCode(inviteData.invite_code)
      }
      if (!link) {
        setLoading(false)
        return
      }

      const childId = link.student_id

      // Get child name
      const { data: childProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', childId)
        .single()
      if (childProfile?.full_name) {
        setChildName(childProfile.full_name.split(' ')[0])
      }

      // Get last 7 days check-ins (summary only - no private fields)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

      const { data: checkins } = await supabase
        .from('parent_child_mood_summary')
        .select('mood_score, stress_score, sleep_quality, checkin_date')
        .eq('student_id', childId)
        .gte('checkin_date', sevenDaysAgoStr)

      // Get journal count (count only - no content)
      const { count: journalCount } = await supabase
        .from('journal_entries')
        .select('id', { count: 'exact' })
        .eq('student_id', childId)
        .eq('is_deleted', false)
        .gte('created_at', sevenDaysAgo.toISOString())

      // Get toolkit usage count
      const { count: toolkitCount } = await supabase
        .from('coping_tool_usage')
        .select('id', { count: 'exact' })
        .eq('student_id', childId)
        .gte('used_at', sevenDaysAgo.toISOString())

      setActivity({
        checkIns: checkins?.length || 0,
        journals: journalCount || 0,
        toolkitUses: toolkitCount || 0,
        totalDays: 7,
      })

      if (!checkins || checkins.length === 0) {
        setLoading(false)
        return
      }

      // Calculate averages
      const avg = (key: string) => {
        const values = checkins.map((c: any) => c[key]).filter(Boolean)
        return values.length
          ? values.reduce((a: number, b: number) => a + b, 0) / values.length
          : 3
      }

      const moodAvg = avg('mood_score')
      const stressAvg = avg('stress_score')
      const sleepAvg = avg('sleep_quality')

      // Set balance status
      if (moodAvg >= 3.5 && stressAvg <= 2.5) {
        setBalanceStatus({
          emoji: '🌿',
          label: 'Balanced',
          description: 'Things seem stable this week',
          color: '#E8F8F6',
          borderColor: '#4DB6AC',
        })
      } else if (moodAvg >= 2.5) {
        setBalanceStatus({
          emoji: '🌱',
          label: 'Some ups and downs',
          description: 'Some emotional fluctuation this week',
          color: '#FFF8E8',
          borderColor: '#F0A500',
        })
      } else {
        setBalanceStatus({
          emoji: '🌧️',
          label: 'Needs attention',
          description: 'Your child may need extra support this week',
          color: '#FFF3E8',
          borderColor: '#F0A500',
        })
      }

      // Set trends
      setTrends({
        mood: moodAvg >= 3.5 ? 'Stable' : moodAvg >= 2.5 ? 'Fluctuating' : 'Lower than usual',
        stress: stressAvg <= 2 ? 'Calm' : stressAvg <= 3 ? 'Moderate' : 'Slightly elevated',
        sleep: sleepAvg >= 3.5 ? 'Good' : sleepAvg >= 2.5 ? 'Irregular' : 'Disrupted',
      })

      // Generate gentle insights
      const newInsights: string[] = []
      if (checkins.length >= 5) {
        newInsights.push(`${childName || 'Your child'} has been checking in consistently this week.`)
      } else if (checkins.length >= 3) {
        newInsights.push(`${childName || 'Your child'} has been engaging with the app this week.`)
      }
      if (stressAvg > 3.5) {
        newInsights.push('Stress levels seem a bit higher than usual this week.')
      }
      if (sleepAvg < 2.5) {
        newInsights.push('Sleep patterns have been a little disrupted recently.')
      }
      if (toolkitCount && toolkitCount > 2) {
        newInsights.push('Engagement with coping tools has increased — a positive sign.')
      }
      if (newInsights.length === 0) {
        newInsights.push('Things seem generally steady this week.')
      }
      setInsights(newInsights)

      // Generate support suggestions
      const newSuggestions: string[] = []
      if (stressAvg > 3) {
        newSuggestions.push('Encourage open conversations without pressure')
        newSuggestions.push('Maintain routine stability at home')
      }
      if (sleepAvg < 3) {
        newSuggestions.push('Support a consistent bedtime routine')
      }
      if (moodAvg < 2.5) {
        newSuggestions.push('Check in casually about their day')
        newSuggestions.push('Create calm, low-pressure time together')
      }
      if (newSuggestions.length === 0) {
        newSuggestions.push('Keep up the supportive environment at home')
        newSuggestions.push('Celebrate small wins with your child')
      }
      setSuggestions(newSuggestions)

    } catch (e) {
      console.log('Parent dashboard error:', e)
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

  const getTrendColor = (trend: string) => {
    if (['Stable', 'Calm', 'Good'].includes(trend)) return '#4DB6AC'
    if (['Fluctuating', 'Moderate', 'Irregular'].includes(trend)) return '#F0A500'
    return '#E05555'
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.parentName}>{parentName}</Text>
        </View>
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
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
          {loading ? (
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          ) : !childName ? (
            // No child linked yet
            <View style={styles.noChildCard}>
              <Text style={styles.noChildEmoji}>👨‍👩‍👧</Text>
              <Text style={styles.noChildTitle}>No child linked yet</Text>
              <Text style={styles.noChildSubtitle}>
                To connect with your child, share your invite code with them. They can enter it in their Tawazon app to link your accounts.
              </Text>
              <View style={styles.inviteCodeCard}>
              <Text style={styles.inviteCodeLabel}>Your invite code</Text>
              <Text style={styles.inviteCode}>{inviteCode || 'Loading...'}</Text>
              <Text style={styles.inviteCodeNote}>
                Share this code with your child. They can enter it in their Tawazon app to link your accounts.
              </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Child overview card */}
              <View style={[
                styles.balanceCard,
                {
                  backgroundColor: balanceStatus.color,
                  borderColor: balanceStatus.borderColor,
                },
              ]}>
                <View style={styles.balanceTop}>
                  <Text style={styles.balanceEmoji}>{balanceStatus.emoji}</Text>
                  <View style={styles.balanceInfo}>
                    <Text style={styles.childNameLabel}>{childName}</Text>
                    <Text style={styles.balanceLabel}>{balanceStatus.label}</Text>
                    <Text style={styles.balanceDescription}>
                      {balanceStatus.description}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Weekly trends */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly trends</Text>
                <View style={styles.trendsCard}>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Mood</Text>
                    <Text style={[
                      styles.trendValue,
                      { color: getTrendColor(trends.mood) },
                    ]}>
                      {trends.mood}
                    </Text>
                  </View>
                  <View style={styles.trendDivider} />
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Stress</Text>
                    <Text style={[
                      styles.trendValue,
                      { color: getTrendColor(trends.stress) },
                    ]}>
                      {trends.stress}
                    </Text>
                  </View>
                  <View style={styles.trendDivider} />
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Sleep</Text>
                    <Text style={[
                      styles.trendValue,
                      { color: getTrendColor(trends.sleep) },
                    ]}>
                      {trends.sleep}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Gentle insights */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Gentle insights</Text>
                <View style={styles.insightsCard}>
                  {insights.map((insight, index) => (
                    <View key={index} style={styles.insightRow}>
                      <Text style={styles.insightDot}>🌿</Text>
                      <Text style={styles.insightText}>{insight}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Ways to support */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ways you can support</Text>
                <View style={styles.suggestionsCard}>
                  {suggestions.map((suggestion, index) => (
                    <View key={index} style={styles.suggestionRow}>
                      <Text style={styles.suggestionDot}>→</Text>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Activity snapshot */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Check-in activity this week</Text>
                <View style={styles.activityCard}>
                  <View style={styles.activityRow}>
                    <View style={styles.activityItem}>
                      <Text style={styles.activityNumber}>{activity.checkIns}/{activity.totalDays}</Text>
                      <Text style={styles.activityLabel}>Check-ins</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityItem}>
                      <Text style={styles.activityNumber}>{activity.journals}</Text>
                      <Text style={styles.activityLabel}>Journal entries</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityItem}>
                      <Text style={styles.activityNumber}>{activity.toolkitUses}</Text>
                      <Text style={styles.activityLabel}>Toolkit uses</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* How Tawazon is helping */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>How Tawazon is helping</Text>
                <View style={styles.helpingCard}>
                  <View style={styles.helpingRow}>
                    <Text style={styles.helpingDot}>🌱</Text>
                    <Text style={styles.helpingText}>
                      Encouraging reflection instead of suppression
                    </Text>
                  </View>
                  <View style={styles.helpingRow}>
                    <Text style={styles.helpingDot}>🌱</Text>
                    <Text style={styles.helpingText}>
                      Building emotional awareness through daily check-ins
                    </Text>
                  </View>
                  <View style={styles.helpingRow}>
                    <Text style={styles.helpingDot}>🌱</Text>
                    <Text style={styles.helpingText}>
                      Providing safe coping tools without judgment
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Privacy first panel */}
          <TouchableOpacity
            style={styles.privacyPanel}
            onPress={() => setShowPrivacyInfo(!showPrivacyInfo)}
            activeOpacity={0.85}
          >
            <View style={styles.privacyPanelTop}>
              <Text style={styles.privacyPanelTitle}>
                Privacy first
              </Text>
              <Text style={styles.privacyPanelArrow}>
                {showPrivacyInfo ? '▲' : '▼'}
              </Text>
            </View>
            {showPrivacyInfo && (
              <Text style={styles.privacyPanelText}>
                You cannot see journal content or personal entries. Check-in notes are private to your child. You see summaries and trends only. This protects your child's willingness to be honest in the app — which is what makes Tawazon effective.
              </Text>
            )}
          </TouchableOpacity>

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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 13,
    color: '#9BA3B0',
    marginBottom: 2,
  },
  parentName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
  },
  signOutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  signOutText: {
    fontSize: 12,
    color: '#9BA3B0',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    marginTop: 40,
  },
  noChildCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noChildEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  noChildTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
  },
  noChildSubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  inviteCodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#9BA3B0',
    marginBottom: 8,
    fontWeight: '500',
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4DB6AC',
    letterSpacing: 4,
    marginBottom: 8,
  },
  inviteCodeNote: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
  },
  balanceCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  balanceEmoji: {
    fontSize: 36,
  },
  balanceInfo: {
    flex: 1,
  },
  childNameLabel: {
    fontSize: 12,
    color: '#9BA3B0',
    fontWeight: '500',
    marginBottom: 2,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  balanceDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BA3B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  trendsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  trendDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  trendLabel: {
    fontSize: 14,
    color: '#2E3A59',
    fontWeight: '500',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  insightDot: {
    fontSize: 14,
    marginTop: 1,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 20,
  },
  suggestionsCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 16,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  suggestionDot: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '600',
    marginTop: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityItem: {
    flex: 1,
    alignItems: 'center',
  },
  activityNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
  },
  activityDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F0F0F0',
  },
  helpingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  helpingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  helpingDot: {
    fontSize: 14,
    marginTop: 1,
  },
  helpingText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  privacyPanel: {
    backgroundColor: '#EDE9FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
  },
  privacyPanelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  privacyPanelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
  },
  privacyPanelArrow: {
    fontSize: 12,
    color: '#B39DDB',
  },
  privacyPanelText: {
    fontSize: 13,
    color: '#4B3B8C',
    lineHeight: 20,
    marginTop: 10,
  },
})