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

const TOOLS = {
  breathing: [
    {
      id: 'box_breathing',
      title: 'Box Breathing',
      description: 'Inhale, hold, exhale, hold. A simple rhythm to calm your mind.',
      duration: '4 mins',
      steps: [
        'Breathe in slowly for 4 counts',
        'Hold your breath for 4 counts',
        'Breathe out slowly for 4 counts',
        'Hold for 4 counts',
        'Repeat 4 times',
      ],
    },
    {
      id: '478_breathing',
      title: '4-7-8 Breathing',
      description: 'Slow your breathing and release tension.',
      duration: '3 mins',
      steps: [
        'Breathe in through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Breathe out through your mouth for 8 counts',
        'This completes one cycle',
        'Repeat 3 more times',
      ],
    },
    {
      id: 'belly_breathing',
      title: 'Belly Breathing',
      description: 'Focus on deep breaths from your diaphragm.',
      duration: '3 mins',
      steps: [
        'Place one hand on your chest, one on your belly',
        'Breathe in slowly through your nose',
        'Feel your belly rise — not your chest',
        'Breathe out slowly through your mouth',
        'Repeat 6 times',
      ],
    },
  ],
  grounding: [
    {
      id: '54321',
      title: '5-4-3-2-1 Senses',
      description: 'Bring yourself back to the present moment using your senses.',
      duration: '5 mins',
      steps: [
        'Name 5 things you can see around you',
        'Name 4 things you can physically touch',
        'Name 3 things you can hear right now',
        'Name 2 things you can smell',
        'Name 1 thing you can taste',
      ],
    },
    {
      id: 'feel_your_feet',
      title: 'Feel Your Feet',
      description: 'A simple body scan to bring you back to now.',
      duration: '2 mins',
      steps: [
        'Sit comfortably and close your eyes',
        'Feel the weight of your feet on the floor',
        'Notice the temperature and pressure',
        'Slowly move your awareness up your legs',
        'Take 3 slow breaths and open your eyes',
      ],
    },
    {
      id: 'cold_water',
      title: 'Cold Water Technique',
      description: 'A quick physical reset for overwhelming moments.',
      duration: '1 min',
      steps: [
        'Go to a sink or get a cold drink',
        'Splash cold water on your face or wrists',
        'Focus on the sensation of the cold',
        'Take 3 deep breaths',
        'Notice how your body feels now',
      ],
    },
  ],
  affirmations: [
    {
      id: 'self_compassion',
      title: 'Self-Compassion Pause',
      description: 'A gentle reminder that you deserve kindness — especially from yourself.',
      duration: '3 mins',
      steps: [
        'Place your hand on your heart',
        'Say: "This is a hard moment"',
        'Say: "I am not alone in feeling this"',
        'Say: "I deserve kindness right now"',
        'Take 3 slow breaths',
      ],
    },
    {
      id: 'morning_affirmations',
      title: 'Morning Affirmations',
      description: 'Start your day with five positive statements.',
      duration: '3 mins',
      steps: [
        'I am doing my best and that is enough',
        'I am allowed to take up space',
        'My feelings are valid',
        'I am more than how I look',
        'Today I choose to be gentle with myself',
      ],
    },
    {
      id: 'self_worth',
      title: 'Self-Worth Reflection',
      description: 'A gentle reminder that your value is not based on performance or appearance.',
      duration: '4 mins',
      steps: [
        'Think of one thing you like about your personality',
        'Think of one person who cares about you',
        'Think of one thing you did well recently',
        'Repeat: "My worth is not defined by how I look"',
        'Take a slow breath and carry this with you',
      ],
    },
  ],
  sleep: [
    {
      id: 'wind_down',
      title: 'Wind-Down Routine',
      description: 'Prepare your mind and body for restful sleep.',
      duration: '10 mins',
      steps: [
        'Dim your screens 30 minutes before bed',
        'Write one good thing that happened today',
        'Tense and release each muscle group slowly',
        'Take 5 slow deep breaths',
        'Let your mind go quiet — no fixing, just rest',
      ],
    },
    {
      id: 'muscle_relaxation',
      title: 'Progressive Muscle Relaxation',
      description: 'Release physical tension from head to toe.',
      duration: '8 mins',
      steps: [
        'Lie down comfortably',
        'Tense your feet for 5 seconds, then release',
        'Move up — calves, thighs, stomach, shoulders',
        'Tense your face for 5 seconds, then release',
        'Notice the difference between tension and calm',
      ],
    },
    {
      id: 'quiet_mind',
      title: 'Quiet Mind Reset',
      description: 'A 60-second breathing and reflection before bed.',
      duration: '1 min',
      steps: [
        'Breathe in for 4 counts',
        'Breathe out for 6 counts',
        'Think of one thing you are grateful for',
        'Let go of everything that happened today',
        'You did enough. You are enough.',
      ],
    },
  ],
  movement: [
    {
      id: 'neck_stretch',
      title: 'Neck & Shoulder Stretch',
      description: 'Release physical tension from your upper body.',
      duration: '3 mins',
      steps: [
        'Roll your shoulders back 5 times slowly',
        'Tilt your head to the right and hold for 10 seconds',
        'Tilt your head to the left and hold for 10 seconds',
        'Gently roll your neck in a half circle',
        'Take 3 deep breaths',
      ],
    },
    {
      id: 'walk',
      title: '5 Minute Walk',
      description: 'Step outside. Movement clears the mind.',
      duration: '5 mins',
      steps: [
        'Stand up and put your phone down',
        'Step outside or walk around your space',
        'Notice 3 things around you as you walk',
        'Breathe naturally and move at your own pace',
        'Come back feeling a little lighter',
      ],
    },
    {
      id: 'shake_it_out',
      title: 'Shake It Out',
      description: 'Release physical tension stored in your body.',
      duration: '2 mins',
      steps: [
        'Stand up with your feet shoulder-width apart',
        'Shake your hands and wrists loosely',
        'Let the shaking move up your arms and shoulders',
        'Shake your whole body for 30 seconds',
        'Stop and notice how your body feels now',
      ],
    },
  ],
  reflection: [
    {
      id: 'quick_feelings_scan',
      title: 'Quick Feelings Scan',
      description: 'Check in with what you are really feeling right now.',
      duration: '3 mins',
      steps: [
        'Ask yourself: what am I feeling right now?',
        'Where do you feel it in your body?',
        'Is this feeling familiar or new?',
        'What does this feeling need from you?',
        'Take one kind action toward yourself',
      ],
    },
    {
      id: 'worry_dump',
      title: 'Worry Dump',
      description: 'Write it. Leave it here. Come back lighter.',
      duration: '5 mins',
      steps: [
        'Get a piece of paper or open your journal',
        'Write everything that is worrying you — no filter',
        'Read it back once',
        'Ask: which of these can I actually control today?',
        'Set the rest aside — they can wait',
      ],
    },
    {
      id: 'one_good_thing',
      title: 'One Good Thing',
      description: 'Find one small positive from today.',
      duration: '2 mins',
      steps: [
        'Think back over your day',
        'Find one moment that felt okay or good',
        'It can be very small — a kind word, a good meal',
        'Hold that moment in your mind for 30 seconds',
        'Say: "Today had something good in it"',
      ],
    },
  ],
}

const FEELINGS = [
  {
    id: 'anxious',
    label: "I'm feeling anxious",
    emoji: '😰',
    color: '#E8F8F6',
    borderColor: '#4DB6AC',
    tools: ['box_breathing', '54321', 'shake_it_out'],
  },
  {
    id: 'low',
    label: "I'm feeling low",
    emoji: '😔',
    color: '#EDE9FF',
    borderColor: '#B39DDB',
    tools: ['self_worth', 'one_good_thing', 'morning_affirmations'],
  },
  {
    id: 'exhausted',
    label: "I'm exhausted",
    emoji: '😴',
    color: '#E6F1FB',
    borderColor: '#4A90D9',
    tools: ['quiet_mind', 'feel_your_feet', 'belly_breathing'],
  },
  {
    id: 'thoughts',
    label: "My thoughts won't stop",
    emoji: '💭',
    color: '#FFF3E8',
    borderColor: '#F0A500',
    tools: ['worry_dump', '478_breathing', '54321'],
  },
  {
    id: 'reset',
    label: 'I just need a reset',
    emoji: '🌱',
    color: '#F0F8FF',
    borderColor: '#4DB6AC',
    tools: ['self_compassion', 'neck_stretch', 'quick_feelings_scan'],
  },
  {
    id: 'unknown',
    label: "I don't know what I need",
    emoji: '🎲',
    color: '#F5F5F5',
    borderColor: '#9BA3B0',
    tools: ['box_breathing', 'one_good_thing', 'self_compassion'],
  },
]

const getAllTools = () => {
  const all: any[] = []
  Object.values(TOOLS).forEach(category => {
    category.forEach(tool => all.push(tool))
  })
  return all
}

const getToolById = (id: string) => {
  return getAllTools().find(t => t.id === id)
}

export default function CopingToolkitScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const stepAnim = useRef(new Animated.Value(0)).current

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
  }, [])

  const handleSelectFeeling = (feelingId: string) => {
    setSelectedFeeling(feelingId)
  }

  const handleSelectTool = (toolId: string) => {
    const tool = getToolById(toolId)
    if (tool) {
      setActiveTool(tool)
      setCurrentStep(0)
      stepAnim.setValue(0)
      Animated.timing(stepAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    }
  }

  const handleNextStep = async () => {
    if (currentStep < activeTool.steps.length - 1) {
      stepAnim.setValue(0)
      setCurrentStep(currentStep + 1)
      Animated.timing(stepAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    } else {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('coping_tool_usage').insert({
            student_id: user.id,
            tool_id: activeTool.id,
          })
        }
      } catch (e) {
        console.log('Usage tracking error:', e)
      }
      setActiveTool(null)
      setSelectedFeeling(null)
      setCurrentStep(0)
    }
  }

  const feeling = FEELINGS.find(f => f.id === selectedFeeling)
  const recommendedTools = feeling?.tools.map(id => getToolById(id)).filter(Boolean) || []

  // Active tool steps view
  if (activeTool) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setActiveTool(null)
              setCurrentStep(0)
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{activeTool.title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.stepsContainer}>
          <View style={styles.stepProgress}>
            {activeTool.steps.map((_: any, i: number) => (
              <View
                key={i}
                style={[
                  styles.stepDot,
                  i <= currentStep && { backgroundColor: '#4DB6AC' },
                ]}
              />
            ))}
          </View>
          <Animated.View
            style={[
              styles.stepCard,
              {
                opacity: stepAnim,
                transform: [{
                  translateY: stepAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            <Text style={styles.stepNumber}>
              Step {currentStep + 1} of {activeTool.steps.length}
            </Text>
            <Text style={styles.stepText}>
              {activeTool.steps[currentStep]}
            </Text>
          </Animated.View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNextStep}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {currentStep < activeTool.steps.length - 1 ? 'Next' : 'Done'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipLink}
            onPress={() => {
              setActiveTool(null)
              setSelectedFeeling(null)
              setCurrentStep(0)
            }}
          >
            <Text style={styles.skipLinkText}>Exit tool</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Recommended tools view
  if (selectedFeeling && feeling) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedFeeling(null)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recommended for you</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={[
              styles.feelingBadge,
              { backgroundColor: feeling.color, borderColor: feeling.borderColor }
            ]}>
              <Text style={styles.feelingBadgeEmoji}>{feeling.emoji}</Text>
              <Text style={styles.feelingBadgeText}>{feeling.label}</Text>
            </View>

            <Text style={styles.recommendedTitle}>
              Here are 3 tools that might help right now:
            </Text>

            {recommendedTools.map((tool: any, index: number) => (
              <TouchableOpacity
                key={tool.id}
                style={styles.recommendedCard}
                onPress={() => handleSelectTool(tool.id)}
                activeOpacity={0.85}
              >
                <View style={styles.recommendedCardLeft}>
                  <Text style={styles.recommendedNumber}>{index + 1}</Text>
                </View>
                <View style={styles.recommendedCardCenter}>
                  <Text style={styles.recommendedCardTitle}>{tool.title}</Text>
                  <Text style={styles.recommendedCardDesc}>{tool.description}</Text>
                  <Text style={styles.recommendedCardDuration}>{tool.duration}</Text>
                </View>
                <Text style={styles.recommendedArrow}>→</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.browseAllButton}
              onPress={() => setSelectedFeeling('browse')}
            >
              <Text style={styles.browseAllText}>Browse all tools instead</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </View>
    )
  }

  // Browse all tools view
  if (selectedFeeling === 'browse') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => setSelectedFeeling(null)}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Tools</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(TOOLS).map(([category, tools]) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category === 'breathing' && '🌬️ Breathing'}
                {category === 'grounding' && '🌿 Grounding'}
                {category === 'affirmations' && '✨ Affirmations'}
                {category === 'sleep' && '🌙 Sleep'}
                {category === 'movement' && '🚶 Movement'}
                {category === 'reflection' && '💭 Reflection'}
              </Text>
              {tools.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolListCard}
                  onPress={() => handleSelectTool(tool.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.toolListCardContent}>
                    <Text style={styles.toolListTitle}>{tool.title}</Text>
                    <Text style={styles.toolListDesc}>{tool.description}</Text>
                    <Text style={styles.toolListDuration}>{tool.duration}</Text>
                  </View>
                  <Text style={styles.recommendedArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }

  // Main entry — "What do you need right now?"
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
        <Text style={styles.headerTitle}>Coping Toolkit</Text>
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
          <Text style={styles.mainTitle}>What do you need right now?</Text>
          <Text style={styles.mainSubtitle}>
            Tawazon will suggest tools based on how you feel.
          </Text>

          <View style={styles.feelingsGrid}>
            {FEELINGS.map((feeling) => (
              <TouchableOpacity
                key={feeling.id}
                style={[
                  styles.feelingCard,
                  {
                    backgroundColor: feeling.color,
                    borderColor: feeling.borderColor,
                  },
                ]}
                onPress={() => handleSelectFeeling(feeling.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
                <Text style={styles.feelingLabel}>{feeling.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.browseAllButton}
            onPress={() => setSelectedFeeling('browse')}
          >
            <Text style={styles.browseAllText}>Browse all 18 tools</Text>
          </TouchableOpacity>

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              These tools support emotional wellbeing. They are not a substitute for professional care.
            </Text>
          </View>
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
  content: {
    width: '100%',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    marginBottom: 28,
    lineHeight: 22,
  },
  feelingsGrid: {
    gap: 12,
    marginBottom: 20,
  },
  feelingCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 14,
  },
  feelingEmoji: {
    fontSize: 24,
  },
  feelingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2E3A59',
  },
  feelingBadge: {
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 20,
  },
  feelingBadgeEmoji: {
    fontSize: 22,
  },
  feelingBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E3A59',
  },
  recommendedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 16,
  },
  recommendedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  recommendedCardLeft: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendedNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4DB6AC',
  },
  recommendedCardCenter: {
    flex: 1,
  },
  recommendedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 3,
  },
  recommendedCardDesc: {
    fontSize: 12,
    color: '#9BA3B0',
    lineHeight: 18,
    marginBottom: 4,
  },
  recommendedCardDuration: {
    fontSize: 11,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  recommendedArrow: {
    fontSize: 16,
    color: '#9BA3B0',
    marginLeft: 8,
  },
  browseAllButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  browseAllText: {
    fontSize: 14,
    color: '#4DB6AC',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footerNote: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  footerNoteText: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 18,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 12,
  },
  toolListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  toolListCardContent: {
    flex: 1,
  },
  toolListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 3,
  },
  toolListDesc: {
    fontSize: 12,
    color: '#9BA3B0',
    lineHeight: 18,
    marginBottom: 4,
  },
  toolListDuration: {
    fontSize: 11,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  stepsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stepProgress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8ECF0',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 12,
    color: '#9BA3B0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  stepText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipLinkText: {
    fontSize: 13,
    color: '#9BA3B0',
  },
})