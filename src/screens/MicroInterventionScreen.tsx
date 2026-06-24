import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
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

export default function MicroInterventionScreen({ navigation, route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [showSteps, setShowSteps] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
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
})