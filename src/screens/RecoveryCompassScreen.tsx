import { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native'
import Svg, {
  Circle,
  Path,
  Defs,
  RadialGradient,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg'
import { supabase } from '../api/supabase'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SIZE = Math.min(SCREEN_WIDTH - 48, 300)
const CENTER = SIZE / 2
const OUTER_RADIUS = SIZE / 2 - 24
const INNER_RADIUS = 44

const ARCS = [
  {
    id: 'mood',
    label: 'Emotional Flow',
    emoji: '🌊',
    startAngle: -110,
    endAngle: -10,
    color: '#B39DDB',
    actionLabel: 'Try journaling',
    actionScreen: 'Journal',
    question: 'What has been shaping your emotions lately?',
    insights: {
      high: 'Your emotional flow has felt fairly steady this week.',
      mid: 'Your emotional flow has felt a little uneven this week.',
      low: 'Your emotional flow has felt heavy and turbulent this week.',
    },
  },
  {
    id: 'stress',
    label: 'Pressure',
    emoji: '⚡',
    startAngle: -10,
    endAngle: 80,
    color: '#F0A500',
    actionLabel: 'Try box breathing',
    actionScreen: 'Coping',
    question: 'What has been feeling heavy or stressful this week?',
    insights: {
      high: 'Pressure levels have been manageable this week.',
      mid: 'Pressure levels increased at points during this week.',
      low: 'Pressure has felt quite intense this week.',
    },
  },
  {
    id: 'sleep',
    label: 'Recovery',
    emoji: '🌙',
    startAngle: 80,
    endAngle: 170,
    color: '#4A90D9',
    actionLabel: 'Try wind-down routine',
    actionScreen: 'Coping',
    question: 'What has been helping you rest or reset?',
    insights: {
      high: 'Your recovery signals look fairly consistent this week.',
      mid: 'Your recovery has been slightly disrupted recently.',
      low: 'Your recovery signals have been lower than usual.',
    },
  },
  {
    id: 'eating',
    label: 'Stability',
    emoji: '🍃',
    startAngle: 170,
    endAngle: 250,
    color: '#4DB6AC',
    actionLabel: 'Try grounding exercise',
    actionScreen: 'Coping',
    question: 'What has helped you stay grounded recently?',
    insights: {
      high: 'Your stability and routine have felt fairly grounded.',
      mid: 'Your daily stability has had some fluctuation.',
      low: 'Your sense of stability has felt unsettled this week.',
    },
  },
]

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
  const s = polarToCartesian(cx, cy, r, end)
  const e = polarToCartesian(cx, cy, r, start)
  const large = end - start <= 180 ? '0' : '1'
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`
}

const getStatus = (scores: Record<string, number>) => {
  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 4
  if (avg >= 0.72) return { label: 'Balanced', color: '#4DB6AC', desc: "You've been managing things well overall this week. Keep going." }
  if (avg >= 0.55) return { label: 'Mostly Steady', color: '#B39DDB', desc: 'Things are fairly steady. A few areas may need gentle attention.' }
  if (avg >= 0.38) return { label: 'Recovering', color: '#F0A500', desc: 'Some areas feel uneven. Small steps will help you rebalance.' }
  return { label: 'Needs gentle attention', color: '#F0A500', desc: 'This week feels heavier. Take things one step at a time.' }
}

const getInsight = (arc: typeof ARCS[0], score: number) => {
  if (score >= 0.65) return arc.insights.high
  if (score >= 0.4) return arc.insights.mid
  return arc.insights.low
}

const MiniTrend = ({ score, color }: { score: number; color: string }) => {
  const w = 72
  const h = 20
  const pts = [0.4, 0.5, score * 0.8, score * 0.9, score, score * 0.95]
  const step = w / (pts.length - 1)
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - p * h}`).join(' ')
  return (
    <Svg width={w} height={h}>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

export default function RecoveryCompassScreen({ navigation }: any) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({ mood: 0.5, stress: 0.5, sleep: 0.5, eating: 0.5 })
  const [hasData, setHasData] = useState(false)

  const pulseAnim = useRef(new Animated.Value(1)).current
  const centerColorAnim = useRef(new Animated.Value(0)).current
  const panelAnim = useRef(new Animated.Value(0)).current
  const centerScale = useRef(new Animated.Value(1)).current

  const arcAnims = useRef(
    ARCS.reduce((acc, arc) => {
      acc[arc.id] = {
        opacity: new Animated.Value(1),
        expand: new Animated.Value(0),
      }
      return acc
    }, {} as Record<string, { opacity: Animated.Value; expand: Animated.Value }>)
  ).current

  useEffect(() => {
    // Breathing
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 3500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3500, useNativeDriver: true }),
      ])
    ).start()

    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: checkins } = await supabase
        .from('daily_checkins')
        .select('mood_score, stress_score, sleep_quality, eating_regularity')
        .eq('student_id', user.id)
        .gte('checkin_date', sevenDaysAgo.toISOString().split('T')[0])

      if (checkins && checkins.length > 0) {
        setHasData(true)
        const avg = (key: string) => {
          const vals = checkins.map((c: any) => c[key]).filter(Boolean)
          return vals.length ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 3
        }
        setScores({
          mood: (avg('mood_score') - 1) / 4,
          stress: (5 - avg('stress_score')) / 4,
          sleep: (avg('sleep_quality') - 1) / 4,
          eating: (avg('eating_regularity') - 1) / 4,
        })
      }
    } catch (e) {
      console.log(e)
    }
  }

  const handleArcTap = (id: string) => {
    if (selectedId === id) {
      handleReset()
      return
    }
    setSelectedId(id)

    ARCS.forEach(arc => {
      Animated.timing(arcAnims[arc.id].opacity, {
        toValue: arc.id === id ? 1 : 0.25,
        duration: 350,
        useNativeDriver: true,
      }).start()
      Animated.spring(arcAnims[arc.id].expand, {
        toValue: arc.id === id ? 1 : 0,
        useNativeDriver: false,
      }).start()
    })

    Animated.spring(centerScale, { toValue: 0.88, useNativeDriver: true }).start()
    Animated.spring(panelAnim, { toValue: 1, useNativeDriver: true }).start()
  }

  const handleReset = () => {
    setSelectedId(null)
    ARCS.forEach(arc => {
      Animated.timing(arcAnims[arc.id].opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start()
      Animated.spring(arcAnims[arc.id].expand, { toValue: 0, useNativeDriver: false }).start()
    })
    Animated.spring(centerScale, { toValue: 1, useNativeDriver: true }).start()
    Animated.timing(panelAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start()
  }

  const status = getStatus(scores)
  const selectedArc = ARCS.find(a => a.id === selectedId)

  const getArcRadius = (id: string) => {
    const score = scores[id] ?? 0.5
    return INNER_RADIUS + score * (OUTER_RADIUS - INNER_RADIUS - 8)
  }

  const getCenterColor = () => {
    if (selectedArc) return selectedArc.color
    return status.color
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recovery Compass</Text>
          <Text style={styles.headerSubtitle}>
            {selectedId ? 'Tap center to return' : 'Tap an arc to explore your balance'}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Compass */}
        <View style={styles.compassWrapper}>
          <Animated.View style={[styles.compassInner, { transform: [{ scale: pulseAnim }] }]}>
            <Svg width={SIZE} height={SIZE}>
              <Defs>
                <RadialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#4DB6AC" stopOpacity="0.1" />
                  <Stop offset="60%" stopColor="#B39DDB" stopOpacity="0.05" />
                  <Stop offset="100%" stopColor="#FAFAFA" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {/* Background glow */}
              <Circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS + 10} fill="url(#bgGlow)" />

              {/* Guide rings */}
              {[0.3, 0.6, 1].map((ratio, i) => (
                <Circle
                  key={i}
                  cx={CENTER}
                  cy={CENTER}
                  r={INNER_RADIUS + ratio * (OUTER_RADIUS - INNER_RADIUS - 8)}
                  fill="none"
                  stroke="#E8ECF0"
                  strokeWidth={0.8}
                  strokeDasharray="3,8"
                />
              ))}

              {/* Outer ring */}
              <Circle cx={CENTER} cy={CENTER} r={OUTER_RADIUS} fill="none" stroke="#E8ECF0" strokeWidth={1} />

              {/* Arcs */}
              {ARCS.map((arc) => {
                const r = getArcRadius(arc.id)
                const isSelected = selectedId === arc.id
                const path = describeArc(CENTER, CENTER, r, arc.startAngle + 5, arc.endAngle - 5)
                const glowPath = describeArc(CENTER, CENTER, r + 3, arc.startAngle + 3, arc.endAngle - 3)

                return (
                  <G key={arc.id}>
                    {/* Glow */}
                    {isSelected && (
                      <Path
                        d={glowPath}
                        stroke={arc.color}
                        strokeWidth={14}
                        strokeOpacity={0.18}
                        fill="none"
                        strokeLinecap="round"
                      />
                    )}
                    {/* Arc */}
                    <Path
                      d={path}
                      stroke={arc.color}
                      strokeWidth={isSelected ? 11 : 8}
                      strokeOpacity={selectedId && !isSelected ? 0.25 : 1}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </G>
                )
              })}

              {/* Center circle */}
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={INNER_RADIUS - 2}
                fill="#FFFFFF"
              />
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={INNER_RADIUS - 2}
                fill="none"
                stroke={getCenterColor()}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
            </Svg>

            {/* Arc tap targets + emoji labels */}
            {ARCS.map((arc) => {
              const midAngle = (arc.startAngle + arc.endAngle) / 2
              const labelPos = polarToCartesian(CENTER, CENTER, OUTER_RADIUS - 12, midAngle)
              const isSelected = selectedId === arc.id

              return (
                <Animated.View
                  key={arc.id}
                  style={[
                    styles.arcLabel,
                    {
                      left: labelPos.x - 22,
                      top: labelPos.y - 22,
                      opacity: arcAnims[arc.id].opacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.arcLabelInner}
                    onPress={() => handleArcTap(arc.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.arcEmoji}>{arc.emoji}</Text>
                    <Text style={[styles.arcLabelText, { color: isSelected ? arc.color : '#9BA3B0' }]}>
                      {arc.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )
            })}

            {/* Center tap */}
            <TouchableOpacity
              style={[styles.centerNode, { left: CENTER - INNER_RADIUS + 2, top: CENTER - INNER_RADIUS + 2, width: (INNER_RADIUS - 2) * 2, height: (INNER_RADIUS - 2) * 2, borderRadius: INNER_RADIUS - 2 }]}
              onPress={handleReset}
              activeOpacity={selectedId ? 0.7 : 1}
            >
              <Animated.Text
                style={[
                  styles.centerText,
                  { color: getCenterColor(), transform: [{ scale: centerScale }] },
                ]}
              >
                {status.label}
              </Animated.Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Focus panel */}
        {selectedArc && (
          <Animated.View
            style={[
              styles.focusPanel,
              { borderColor: selectedArc.color + '88', shadowColor: selectedArc.color },
              {
                opacity: panelAnim,
                transform: [{
                  translateY: panelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                }],
              },
            ]}
          >
            {/* Top row */}
            <View style={styles.focusTop}>
              <View style={styles.focusTopLeft}>
                <Text style={styles.focusEmoji}>{selectedArc.emoji}</Text>
                <Text style={[styles.focusLabel, { color: selectedArc.color }]}>
                  {selectedArc.label}
                </Text>
              </View>
              <MiniTrend score={scores[selectedArc.id] ?? 0.5} color={selectedArc.color} />
            </View>

            {/* Insight */}
            <Text style={styles.focusInsight}>
              {getInsight(selectedArc, scores[selectedArc.id] ?? 0.5)}
            </Text>

            {/* Reflection question */}
            <View style={[styles.focusQuestionCard, { borderColor: selectedArc.color }]}>
              <Text style={styles.focusQuestion}>{selectedArc.question}</Text>
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[styles.focusAction, { backgroundColor: selectedArc.color, shadowColor: selectedArc.color }]}
              onPress={() => navigation.navigate(selectedArc.actionScreen)}
              activeOpacity={0.85}
            >
              <Text style={styles.focusActionText}>{selectedArc.actionLabel}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Status card — only when nothing selected */}
        {!selectedId && (
          <View style={[styles.statusCard, { borderColor: status.color + '55' }]}>
            <View style={styles.statusTop}>
              <View style={[styles.statusDot, { backgroundColor: status.color }]} />
              <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusDesc}>{status.desc}</Text>
            </View>
          </View>
        )}

        {/* No data */}
        {!hasData && (
          <View style={styles.noDataCard}>
            <Text style={styles.noDataEmoji}>🧭</Text>
            <Text style={styles.noDataText}>
              Complete your first check-in to bring your compass to life.
            </Text>
            <TouchableOpacity
              style={styles.noDataButton}
              onPress={() => navigation.navigate('CheckIn')}
              activeOpacity={0.85}
            >
              <Text style={styles.noDataButtonText}>Start check-in</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Privacy note */}
        <Text style={styles.privacyNote}>
          🔒 Your compass is private. Insights are supportive and not clinical or diagnostic.
        </Text>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: { width: 40 },
  backText: { fontSize: 14, color: '#4DB6AC', fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#2E3A59', letterSpacing: -0.2 },
  headerSubtitle: { fontSize: 11, color: '#9BA3B0', marginTop: 3, letterSpacing: 0.2 },
  scrollContent: {
    paddingBottom: 48,
    alignItems: 'center',
    paddingTop: 24,
  },
  compassWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  compassInner: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
  },
  arcLabel: {
    position: 'absolute',
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcLabelInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcEmoji: { fontSize: 16 },
  arcLabelText: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  centerNode: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  centerText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 6,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
  focusPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 24,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    width: SCREEN_WIDTH - 48,
    marginBottom: 16,
  },
  focusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  focusTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  focusEmoji: { fontSize: 24 },
  focusLabel: { fontSize: 18, fontWeight: '700', letterSpacing: -0.2 },
  focusInsight: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 23,
    marginBottom: 14,
  },
  focusQuestionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  focusQuestion: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 21,
  },
  focusAction: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  focusActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 24,
    borderWidth: 1.5,
    width: SCREEN_WIDTH - 48,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  statusDesc: { fontSize: 13, color: '#9BA3B0', lineHeight: 21 },
  noDataCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 24,
    alignItems: 'center',
    width: SCREEN_WIDTH - 48,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C8EFEC',
  },
  noDataEmoji: { fontSize: 36, marginBottom: 12 },
  noDataText: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  noDataButton: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 13,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  noDataButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  privacyNote: {
    fontSize: 11,
    color: '#C0C8D0',
    textAlign: 'center',
    marginHorizontal: 24,
    lineHeight: 18,
    marginTop: 8,
  },
})