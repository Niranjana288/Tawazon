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

const MODULES = [
  {
    id: 1,
    title: 'Understanding Your Thoughts',
    subtitle: 'Learn how thoughts shape how you feel',
    duration: '3 mins',
    color: '#E8F8F6',
    borderColor: '#4DB6AC',
    sections: [
      {
        type: 'read',
        title: 'What are automatic thoughts?',
        content: `Every day your mind produces hundreds of thoughts automatically — without you choosing them.\n\nThese thoughts happen so fast you might not even notice them. But they have a huge effect on how you feel.\n\nFor example:\nSituation: You make a mistake at school\nAutomatic thought: "I'm so stupid"\nFeeling: Shame, anxiety\n\nThe thought happened in a split second — but the feeling can last all day.`,
      },
      {
        type: 'read',
        title: 'How thoughts affect feelings',
        content: `Here is something important:\n\nThoughts are not facts.\n\n"I'm so stupid" feels true in that moment. But is it actually true? Probably not.\n\nCBT (Cognitive Behavioural Therapy) teaches us to notice these automatic thoughts and question them — gently, not harshly.\n\nWhen we change the thought, the feeling often changes too.`,
      },
      {
        type: 'practice',
        title: 'Spot the thought',
        prompt: 'Think of a recent moment when you felt bad about yourself. What was the automatic thought that appeared?',
        placeholder: 'Write the thought here — just for you...',
      },
    ],
  },
  {
    id: 2,
    title: 'Challenging Negative Thoughts',
    subtitle: 'Question thoughts that bring you down',
    duration: '4 mins',
    color: '#EDE9FF',
    borderColor: '#B39DDB',
    sections: [
      {
        type: 'read',
        title: 'Is this thought 100% true?',
        content: `When a negative thought appears, try asking:\n\n"Is this thought 100% true?"\n\nMost of the time, the answer is no.\n\n"I always mess everything up"\n→ Always? Really? Every single thing?\n\n"Nobody likes me"\n→ Nobody? Not one single person?\n\nThese thoughts are called cognitive distortions — they twist reality to feel worse than it is.\n\nNoticing this is the first step to changing it.`,
      },
      {
        type: 'read',
        title: 'What would you tell a friend?',
        content: `Here is a powerful technique:\n\nImagine your best friend came to you with the same thought.\n\nThey said: "I'm so stupid. I made one mistake and ruined everything."\n\nWhat would you say to them?\n\nYou would probably be much kinder than you are to yourself.\n\nCBT asks: why not speak to yourself the same way you would speak to a friend you love?`,
      },
      {
        type: 'practice',
        title: 'Reframe the thought',
        prompt: 'Write a negative thought you have often. Then rewrite it the way you would say it to a friend.',
        placeholder: 'My negative thought: ...\n\nIf my friend said this, I would tell them: ...',
      },
    ],
  },
  {
    id: 3,
    title: 'Understanding Your Emotions',
    subtitle: 'Name what you feel to take away its power',
    duration: '3 mins',
    color: '#FFF3E8',
    borderColor: '#F0A500',
    sections: [
      {
        type: 'read',
        title: 'Emotions vs feelings vs sensations',
        content: `These three things are connected but different:\n\nSensation: a physical experience in your body\n→ "My stomach feels tight"\n\nEmotion: the label we give that experience\n→ "I feel anxious"\n\nFeeling: the story we tell about it\n→ "Something bad is going to happen"\n\nSometimes what we think is hunger is actually anxiety.\nSometimes what we think is tiredness is actually sadness.\n\nLearning to tell the difference is a superpower.`,
      },
      {
        type: 'read',
        title: 'The emotion behind the behaviour',
        content: `Many behaviours we struggle with are actually emotions in disguise.\n\nSkipping a meal → might be anxiety about control\nEating when not hungry → might be loneliness or boredom\nAvoiding social eating → might be fear of judgment\n\nNone of this is weakness. It is your mind trying to cope.\n\nWhen we understand the emotion behind the behaviour, we can respond to the real need — not just the surface action.`,
      },
      {
        type: 'practice',
        title: 'Name the emotion',
        prompt: 'Think of something you did recently that you felt conflicted about. What emotion do you think was underneath it?',
        placeholder: 'The behaviour was...\n\nThe emotion underneath might have been...',
      },
    ],
  },
  {
    id: 4,
    title: 'Building Coping Patterns',
    subtitle: 'Understand your cycle and break it gently',
    duration: '4 mins',
    color: '#F0F8FF',
    borderColor: '#4A90D9',
    sections: [
      {
        type: 'read',
        title: 'The thought-feeling-action cycle',
        content: `Everything we do follows a cycle:\n\nTrigger → Thought → Feeling → Action\n\nExample:\nTrigger: Someone comments on what you are eating\nThought: "Everyone is judging me"\nFeeling: Shame and anxiety\nAction: Restrict eating for the rest of the day\n\nThe action feels like it helps — but it usually makes the feeling stronger next time.\n\nCBT helps us interrupt this cycle at the thought stage — before it becomes a feeling and then an action.`,
      },
      {
        type: 'read',
        title: 'Breaking the cycle',
        content: `You cannot always control the trigger.\nYou cannot always control the automatic thought.\n\nBut you CAN:\n\n1. Notice the thought ("there it is again")\n2. Question it ("is this actually true?")\n3. Choose a different response\n\nThis takes practice. It will not work perfectly at first.\n\nBut every time you notice the thought instead of just reacting to it — that is progress.\n\nThat is what recovery looks like. Small moments of awareness, one at a time.`,
      },
      {
        type: 'practice',
        title: 'Map your pattern',
        prompt: 'Think of a situation that often triggers difficult feelings for you. Map out your cycle: Trigger → Thought → Feeling → Action.',
        placeholder: 'Trigger: ...\nThought: ...\nFeeling: ...\nAction: ...\n\nWhat could I do differently at the thought stage?',
      },
    ],
  },
]

export default function CBTScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const [activeModule, setActiveModule] = useState<any>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [practiceText, setPracticeText] = useState('')
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const sectionAnim = useRef(new Animated.Value(0)).current

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

  const animateSection = () => {
    sectionAnim.setValue(0)
    Animated.timing(sectionAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  const handleOpenModule = (module: any) => {
    setActiveModule(module)
    setCurrentSection(0)
    setPracticeText('')
    animateSection()
  }

  const handleNext = () => {
    if (currentSection < activeModule.sections.length - 1) {
      setCurrentSection(currentSection + 1)
      setPracticeText('')
      animateSection()
    } else {
      if (!completedModules.includes(activeModule.id)) {
        setCompletedModules([...completedModules, activeModule.id])
      }
      setActiveModule(null)
      setCurrentSection(0)
      setPracticeText('')
    }
  }

  const section = activeModule?.sections[currentSection]

  // Active module view
  if (activeModule && section) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setActiveModule(null)
              setCurrentSection(0)
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeModule.title}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress dots */}
        <View style={styles.progressRow}>
          {activeModule.sections.map((_: any, i: number) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i <= currentSection && { backgroundColor: '#4DB6AC' },
              ]}
            />
          ))}
          <Text style={styles.progressText}>
            {currentSection + 1} of {activeModule.sections.length}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.sectionContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: sectionAnim,
              transform: [{
                translateY: sectionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            }}
          >
            {/* Section type badge */}
            <View style={[
              styles.typeBadge,
              section.type === 'practice'
                ? { backgroundColor: '#EDE9FF' }
                : { backgroundColor: '#E8F8F6' },
            ]}>
              <Text style={[
                styles.typeBadgeText,
                section.type === 'practice'
                  ? { color: '#3C3489' }
                  : { color: '#085041' },
              ]}>
                {section.type === 'practice' ? 'Practice' : 'Learn'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.type === 'read' && (
              <View style={styles.readCard}>
                <Text style={styles.readContent}>{section.content}</Text>
              </View>
            )}

            {section.type === 'practice' && (
              <View>
                <View style={styles.practicePromptCard}>
                  <Text style={styles.practicePrompt}>{section.prompt}</Text>
                </View>
                <View style={styles.privacyBadge}>
                  <Text style={styles.privacyBadgeText}>
                    Private to you — never shared
                  </Text>
                </View>
                <TextInput
                  style={styles.practiceInput}
                  placeholder={section.placeholder}
                  placeholderTextColor="#C0C8D0"
                  value={practiceText}
                  onChangeText={setPracticeText}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {currentSection < activeModule.sections.length - 1
                  ? 'Continue'
                  : 'Complete module'}
              </Text>
            </TouchableOpacity>

            {currentSection === activeModule.sections.length - 1 && (
              <View style={styles.completionNote}>
                <Text style={styles.completionNoteText}>
                  Completing this module takes courage. Well done for showing up.
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    )
  }

  // Module list
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
        <Text style={styles.headerTitle}>CBT Tools</Text>
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
          <Text style={styles.pageTitle}>Learn and grow</Text>
          <Text style={styles.pageSubtitle}>
            Short modules to help you understand your thoughts, emotions and patterns.
          </Text>

          {/* Progress summary */}
          <View style={styles.progressCard}>
            <Text style={styles.progressCardTitle}>Your progress</Text>
            <Text style={styles.progressCardCount}>
              {completedModules.length} of {MODULES.length} modules completed
            </Text>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(completedModules.length / MODULES.length) * 100}%` as any,
                  },
                ]}
              />
            </View>
          </View>

          {/* Modules */}
          {MODULES.map((module) => {
            const isCompleted = completedModules.includes(module.id)
            return (
              <TouchableOpacity
                key={module.id}
                style={[
                  styles.moduleCard,
                  {
                    backgroundColor: module.color,
                    borderColor: isCompleted ? '#4DB6AC' : module.borderColor,
                  },
                ]}
                onPress={() => handleOpenModule(module)}
                activeOpacity={0.85}
              >
                <View style={styles.moduleCardTop}>
                  <View style={styles.moduleNumber}>
                    <Text style={styles.moduleNumberText}>
                      {isCompleted ? '✓' : module.id}
                    </Text>
                  </View>
                  <View style={styles.moduleInfo}>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                    <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
                  </View>
                </View>
                <View style={styles.moduleCardBottom}>
                  <Text style={styles.moduleDuration}>{module.duration}</Text>
                  <Text style={styles.moduleArrow}>
                    {isCompleted ? 'Review' : 'Start'} →
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              These modules are educational tools based on CBT principles. They are not a substitute for professional therapy.
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
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    lineHeight: 22,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  progressCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  progressCardCount: {
    fontSize: 12,
    color: '#9BA3B0',
    marginBottom: 10,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4DB6AC',
    borderRadius: 3,
  },
  moduleCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  moduleCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E3A59',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  moduleCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleDuration: {
    fontSize: 12,
    color: '#9BA3B0',
    fontWeight: '500',
  },
  moduleArrow: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E8ECF0',
  },
  progressText: {
    fontSize: 11,
    color: '#9BA3B0',
    marginLeft: 'auto',
  },
  sectionContent: {
    padding: 24,
    paddingBottom: 40,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 16,
    lineHeight: 30,
  },
  readCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  readContent: {
    fontSize: 15,
    color: '#2E3A59',
    lineHeight: 26,
  },
  practicePromptCard: {
    backgroundColor: '#EDE9FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#B39DDB',
  },
  practicePrompt: {
    fontSize: 14,
    color: '#2E3A59',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  privacyBadge: {
    backgroundColor: '#E8F8F6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  privacyBadgeText: {
    fontSize: 11,
    color: '#085041',
    fontWeight: '500',
  },
  practiceInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#2E3A59',
    minHeight: 120,
    lineHeight: 22,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  completionNote: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  completionNoteText: {
    fontSize: 13,
    color: '#4DB6AC',
    lineHeight: 20,
    fontStyle: 'italic',
  },
})