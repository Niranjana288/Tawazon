import { useRef, useEffect, useState } from 'react'
import { supabase } from '../api/supabase'
import { getUserFlags } from '../utils/getUserFlags'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView
} from 'react-native'

const INTERVENTIONS = [
  {
    id: 'breathing',
    title: 'Box Breathing',
    subtitle: '30 seconds · Calms your nervous system',
    icon: '🌬️',
    color: '#E8F8F6',
    borderColor: '#4DB6AC',
    steps: [
      'Breathe in slowly for 4 counts',
      'Hold for 4 counts',
      'Breathe out for 4 counts',
      'Hold for 4 counts',
      'Repeat 3 times',
    ],
  },
  {
    id: 'grounding',
    title: '5-4-3-2-1 Grounding',
    subtitle: '60 seconds · Brings you back to now',
    icon: '🌿',
    color: '#EDE9FF',
    borderColor: '#B39DDB',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
    ],
  },
]
const ED_TOOLS = [
  {
    id: 'urge_surfing',
    title: 'Ride the wave 🌊',
    description: 'This feeling is intense right now — but like a wave, it will peak and then pass.',
    duration: '2 minutes',
    steps: [
      'Notice the urge without acting on it',
      'Name it: "I am having a difficult moment right now"',
      'Breathe slowly for 60 seconds',
      'Rate the feeling out of 10 — watch it change',
    ],
  },
  {
    id: 'grounding',
    title: 'Come back to now 🌿',
    description: 'After a difficult moment, this can help you return to the present.',
    duration: '3 minutes',
    steps: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Take 3 slow breaths',
      'Say: "I am safe right now"',
    ],
  },
  {
    id: 'self_compassion',
    title: 'What you deserve to hear 💛',
    description: 'Read these slowly. You do not have to believe them fully yet — just let them in.',
    duration: '2 minutes',
    steps: [
      'You deserve to eat. Every day, without conditions.',
      'Your body is doing its best for you.',
      'One difficult moment does not erase your progress.',
      'You are more than what you eat or how you look.',
      'It is okay to struggle. It does not mean you are failing.',
    ],
  },
]

export default function MicroInterventionScreen({ navigation, route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [edMode, setEdMode] = useState(false)
  const stepAnim = useRef(new Animated.Value(0)).current

  const moodScore = route.params?.moodScore || 2
  const stressLevel = route.params?.stressLevel || 3

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
    const isEdMode = route.params?.edMode || false
    setEdMode(isEdMode)
  }, [])
  

  const handleSelectTool = (id: string) => {
    setSelectedTool(id)
    setShowSteps(true)
    setCurrentStep(0)
    stepAnim.setValue(0)
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  const handleNextStep = () => {
    const tool = INTERVENTIONS.find(t => t.id === selectedTool)
    if (!tool) return
    if (currentStep < tool.steps.length - 1) {
      stepAnim.setValue(0)
      setCurrentStep(currentStep + 1)
      Animated.timing(stepAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    } else {
      navigation.navigate('StudentHome')
    }
  }

  const tool = INTERVENTIONS.find(t => t.id === selectedTool)

  if (showSteps && tool) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.stepsContent}>
          <Text style={styles.toolTitle}>{tool.title}</Text>
          <View style={styles.stepProgress}>
            {tool.steps.map((_, i) => (
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
              { borderColor: tool.borderColor },
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
            <Text style={styles.stepNumber}>Step {currentStep + 1}</Text>
            <Text style={styles.stepText}>{tool.steps[currentStep]}</Text>
          </Animated.View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleNextStep}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {currentStep < tool.steps.length - 1 ? 'Next' : 'Done'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipLink}
            onPress={() => navigation.navigate('StudentHome')}
          >
            <Text style={styles.skipLinkText}>Skip and go home</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 24 }}
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
          <Text style={styles.title}>Take a moment</Text>
          <Text style={styles.subtitle}>
            {moodScore <= 2
              ? "It sounds like today has been a bit hard. A quick reset might help."
              : "Your stress seems a little high. Want to try something calming?"}
          </Text>
        </View>

        {/* Tool cards */}
  {edMode && (
  <View style={styles.edToolsSection}>
    <Text style={styles.edToolsTitle}>
      Something gentle for this moment
    </Text>
    <Text style={styles.edToolsSubtitle}>
      This feeling will pass. These tools can help you through it.
    </Text>
    {ED_TOOLS.map(tool => (
      <View key={tool.id} style={styles.edToolCard}>
        <Text style={styles.edToolTitle}>{tool.title}</Text>
        <Text style={styles.edToolDuration}>{tool.duration}</Text>
        <Text style={styles.edToolDesc}>{tool.description}</Text>
        <View style={styles.edToolSteps}>
          {tool.steps.map((step, index) => (
            <View key={index} style={styles.edToolStep}>
              <View style={styles.edToolStepDot} />
              <Text style={styles.edToolStepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    ))}
    <View style={styles.edSupportNote}>
      <Text style={styles.edSupportText}>
        If things feel too heavy, speaking to a school counselor or trusted adult is always a brave step.
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate('SupportCenter')}
        style={styles.edSupportButton}
      >
        <Text style={styles.edSupportButtonText}>Find support →</Text>
      </TouchableOpacity>
    </View>
  </View>
)}
        {INTERVENTIONS.map((intervention) => (
          <TouchableOpacity
            key={intervention.id}
            style={[
              styles.toolCard,
              { backgroundColor: intervention.color, borderColor: intervention.borderColor },
            ]}
            onPress={() => handleSelectTool(intervention.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.toolIcon}>{intervention.icon}</Text>
            <View style={styles.toolTextContainer}>
              <Text style={styles.toolTitle}>{intervention.title}</Text>
              <Text style={styles.toolSubtitle}>{intervention.subtitle}</Text>
            </View>
            <Text style={styles.toolArrow}>→</Text>
          </TouchableOpacity>
        ))}

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate('StudentHome')}
          activeOpacity={0.85}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          These tools are optional. There is no pressure.
        </Text>

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
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    lineHeight: 22,
  },
  toolCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  toolIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  toolTextContainer: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 12,
    color: '#9BA3B0',
  },
  toolArrow: {
    fontSize: 18,
    color: '#9BA3B0',
    marginLeft: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  skipText: {
    fontSize: 14,
    color: '#9BA3B0',
  },
  footerNote: {
    fontSize: 12,
    color: '#C0C8D0',
    textAlign: 'center',
    marginTop: 8,
  },
  stepsContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  stepProgress: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
    marginTop: 16,
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
    borderWidth: 2,
    shadowColor: '#B39DDB',
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
    fontSize: 20,
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
  edToolsSection: {
    marginBottom: 24,
  },
  edToolsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 6,
  },
  edToolsSubtitle: {
    fontSize: 13,
    color: '#9BA3B0',
    lineHeight: 20,
    marginBottom: 16,
  },
  edToolCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  edToolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  edToolDuration: {
    fontSize: 11,
    color: '#4DB6AC',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  edToolDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  edToolSteps: { gap: 10 },
  edToolStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  edToolStepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4DB6AC',
    marginTop: 7,
  },
  edToolStepText: {
    fontSize: 13,
    color: '#2E3A59',
    lineHeight: 20,
    flex: 1,
  },
  edSupportNote: {
    backgroundColor: '#F0FAFA',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  edSupportText: {
    fontSize: 13,
    color: '#2E3A59',
    lineHeight: 20,
    marginBottom: 10,
  },
  edSupportButton: {
    alignSelf: 'flex-start',
  },
  edSupportButtonText: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '600',
  },
})