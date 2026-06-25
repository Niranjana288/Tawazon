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

const TRIGGER_CONTENT: Record<string, {
  emoji: string
  label: string
  validation: string
  insight: string
  suggestion: string
}> = {
  social_media: {
    emoji: '📱',
    label: 'Social media',
    validation: "Social media can make it easy to feel like everyone else has things figured out. That feeling is more common than you think.",
    insight: "What we see online is carefully chosen. It rarely reflects the full picture of someone's life.",
    suggestion: "A short break from scrolling — even 15 minutes — can help reset how you feel.",
  },
  friendships: {
    emoji: '👥',
    label: 'Friendships',
    validation: "Friendships can be one of the most meaningful — and sometimes most difficult — parts of life. You are not alone in finding them complicated.",
    insight: "It is okay if some relationships feel uncertain right now. Connections change and grow over time.",
    suggestion: "Talking to someone you trust, even briefly, can help lighten what you are carrying.",
  },
  school: {
    emoji: '🏫',
    label: 'School or studies',
    validation: "Academic pressure is real and it affects so many people. Feeling overwhelmed by school is not a sign of weakness.",
    insight: "Difficult periods at school are temporary. They do not define your future or your worth.",
    suggestion: "Breaking things into smaller steps and taking regular breaks can make heavy workloads feel more manageable.",
  },
  family: {
    emoji: '🏠',
    label: 'Family',
    validation: "Family dynamics can affect us in deep ways, even when it is hard to explain why. What you feel is valid.",
    insight: "It is okay to find family situations complicated. You do not have to have it all figured out.",
    suggestion: "Talking to a trusted adult or school counselor can help when family feels heavy.",
  },
  body_image: {
    emoji: '🪞',
    label: 'Body image',
    validation: "How we feel about ourselves can be one of the most sensitive and private experiences. Whatever you are feeling, you are not alone.",
    insight: "How we see ourselves is often shaped by comparison, stress, and things outside our control — not by who we actually are.",
    suggestion: "The Self Worth Hub in Tawazon has gentle reflections that might help right now.",
  },
  future: {
    emoji: '🔮',
    label: 'Future worries',
    validation: "Worrying about the future is something almost everyone experiences. It does not mean things will go wrong.",
    insight: "You do not have to have everything figured out right now. Taking things one day at a time is enough.",
    suggestion: "The Worry Dump tool in the Coping Toolkit can help you put future worries somewhere outside your mind for a while.",
  },
  multiple: {
    emoji: '🌀',
    label: 'Multiple things',
    validation: "When multiple things are weighing on you at once, it makes sense that everything feels heavier. That is not weakness — it is a lot to carry.",
    insight: "You do not have to address everything at once. Focusing on one small thing at a time is enough.",
    suggestion: "The Coping Toolkit has tools that can help when everything feels like too much.",
  },
}

export default function TriggerAwarenessScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const [triggers, setTriggers] = useState<string[]>([])
  const [selectedTrigger, setSelectedTrigger] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const panelAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()
    fetchTriggers()
  }, [])

  const fetchTriggers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('mood_triggers')
        .eq('id', user.id)
        .single()
      if (data?.mood_triggers) {
        setTriggers(data.mood_triggers)
        if (data.mood_triggers.length > 0) {
          setSelectedTrigger(data.mood_triggers[0])
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTrigger = (triggerId: string) => {
    setSelectedTrigger(triggerId)
    panelAnim.setValue(0)
    Animated.spring(panelAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const selectedContent = selectedTrigger ? TRIGGER_CONTENT[selectedTrigger] : null

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What's influencing you?</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Intro */}
          <View style={styles.introCard}>
            <Text style={styles.introText}>
              These are the things you told us affect your mood. Tap any one to explore it gently.
            </Text>
          </View>

          {/* Trigger chips */}
          {loading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : triggers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                You haven't selected any mood triggers yet. You can update this in your profile settings.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.triggersRow}>
                {triggers.map(triggerId => {
                  const content = TRIGGER_CONTENT[triggerId]
                  if (!content) return null
                  const isSelected = selectedTrigger === triggerId
                  return (
                    <TouchableOpacity
                      key={triggerId}
                      style={[
                        styles.triggerChip,
                        isSelected && styles.triggerChipSelected,
                      ]}
                      onPress={() => handleSelectTrigger(triggerId)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.triggerChipEmoji}>{content.emoji}</Text>
                      <Text style={[
                        styles.triggerChipLabel,
                        isSelected && styles.triggerChipLabelSelected,
                      ]}>
                        {content.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Selected trigger content */}
              {selectedContent && (
                <Animated.View
                  style={[
                    styles.contentCard,
                    {
                      opacity: panelAnim,
                      transform: [{
                        translateY: panelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      }],
                    },
                  ]}
                >
                  {/* Validation */}
                  <View style={styles.validationSection}>
                    <Text style={styles.validationLabel}>You are not alone</Text>
                    <Text style={styles.validationText}>
                      {selectedContent.validation}
                    </Text>
                  </View>

                  {/* Insight */}
                  <View style={styles.insightSection}>
                    <Text style={styles.insightLabel}>A gentle perspective</Text>
                    <Text style={styles.insightText}>
                      {selectedContent.insight}
                    </Text>
                  </View>

                  {/* Suggestion */}
                  <View style={styles.suggestionSection}>
                    <Text style={styles.suggestionLabel}>Something that might help</Text>
                    <Text style={styles.suggestionText}>
                      {selectedContent.suggestion}
                    </Text>
                  </View>

                  {/* Action buttons */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('Coping')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionButtonText}>Coping tools</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButtonSecondary}
                      onPress={() => navigation.navigate('Journal')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.actionButtonSecondaryText}>Write about it</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </>
          )}

          {/* Support note */}
          <View style={styles.supportNote}>
            <Text style={styles.supportNoteTitle}>
              Need more support?
            </Text>
            <Text style={styles.supportNoteText}>
              If things feel too heavy to carry alone, speaking to a school counselor or trusted adult is always a brave step. You deserve real human support.
            </Text>
            <View style={styles.supportResources}>
              <Text style={styles.supportResource}>🏫 School counselor</Text>
              <Text style={styles.supportResource}>📞 Emirates Health Services: 800-11111</Text>
              <Text style={styles.supportResource}>🏠 A trusted adult at home</Text>
            </View>
          </View>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 This is private to you and never shared.
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
  introCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  introText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
  },
  loadingText: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 22,
  },
  triggersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  triggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
  },
  triggerChipSelected: {
    backgroundColor: '#E8F8F6',
    borderColor: '#4DB6AC',
  },
  triggerChipEmoji: { fontSize: 16 },
  triggerChipLabel: {
    fontSize: 13,
    color: '#9BA3B0',
    fontWeight: '500',
  },
  triggerChipLabelSelected: {
    color: '#4DB6AC',
    fontWeight: '600',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  validationSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  validationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4DB6AC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  validationText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
  },
  insightSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  insightLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B39DDB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  suggestionSection: {
    marginBottom: 16,
  },
  suggestionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F0A500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4DB6AC',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  supportNote: {
    backgroundColor: '#2E3A59',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  supportNoteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  supportNoteText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 14,
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
  },
})