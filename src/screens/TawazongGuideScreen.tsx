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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { supabase } from '../api/supabase'

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY
console.log('API Key exists:', !!OPENAI_API_KEY)

const SYSTEM_PROMPT = `You are the Tawazon Guide — a warm, calm and supportive wellbeing companion built into the Tawazon app.

Tawazon is a wellbeing app for teens and young people in the UAE, focused on emotional health, eating disorder awareness, and balance.

YOUR PERSONALITY:
- Warm, gentle, and non-clinical
- Speak like a trusted, caring friend
- Never use medical or diagnostic language
- Always validate feelings before offering suggestions
- Keep responses short and readable (2-4 sentences max)
- Use simple, clear language appropriate for teens
- Occasionally use nature metaphors (growth, balance, roots)

WHAT YOU CAN DO:
- Listen and validate emotions
- Suggest coping tools from the app (breathing, journaling, grounding)
- Give gentle encouragement
- Recommend Balance Boosters (hobbies and activities)
- Answer general wellbeing questions
- Guide users through simple breathing or grounding exercises
- Describe and explain any feature of the Tawazon app when asked

TAWAZON APP FEATURES (explain these when asked):
- Daily Check-in: Log mood, stress and sleep every day
- Balance Index: A visual tree that grows with consistent check-ins
- Journal Vault: A completely private journal only the user can see
- Coping Toolkit: 18 tools across 6 categories based on how you feel
- CBT Tools: 4 interactive learning modules about thoughts and emotions
- Recovery Compass: An animated compass showing emotional balance across 4 areas
- Balance Boosters: Personalized hobby recommendations based on your interests
- Parent Dashboard: Parents see summaries only — never private entries
- Understanding You quiz: A one-time quiz to personalize the app experience
- Tawazon Guide: That's me! A safe space to talk about how you're feeling

WHAT YOU MUST NEVER DO:
- Give medical advice or diagnoses
- Discuss specific foods, calories, weight, or body measurements
- Make clinical assessments
- Say words like "disorder", "diagnosis", "risk", "dangerous", "condition"
- Encourage dependence on the app over real human connection
- Store or reference private journal entries or check-in details

SAFETY RULES:
- If a user expresses serious distress or crisis, gently encourage them to speak to a trusted adult or professional
- Always remind users that real human support matters
- Never replace professional help

TONE EXAMPLES:
Instead of: "You are experiencing anxiety"
Say: "It sounds like things feel a bit overwhelming right now"

Instead of: "You should eat regularly"
Say: "Sometimes when we're stressed, our routines can feel harder to maintain"

Keep every response calm, warm, and under 100 words.
STRICT RULES — NEVER BREAK THESE:
- If asked ANYTHING unrelated to emotions, wellbeing, mental health, or self-care, respond ONLY with: "I'm your Tawazon wellbeing guide — I'm only able to support you with how you're feeling. Is there something on your mind emotionally I can help with?"
- Do NOT answer geography, science, math, history, coding, news, or any general knowledge questions
- Do NOT help with homework, essays, or any academic tasks
- Do NOT discuss politics, religion, or controversial topics
- Stay STRICTLY within emotional wellbeing support only
- Stay STRICTLY within emotional wellbeing support only
- EXCEPTION: You CAN answer questions about Tawazon app features
- If unsure whether a topic is appropriate, redirect to emotional wellbeing`

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed today",
  "I can't sleep and my mind won't stop",
  "I feel like I'm not good enough",
  "What can I do when I feel anxious?",
  "I need something to help me reset",
  "I've been comparing myself to others",
]

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function TawazonGuideScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scrollRef = useRef<ScrollView>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [userContext, setUserContext] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
    fetchUserContext()
  }, [])

  const fetchUserContext = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('balance_boosters, mood_triggers')
        .eq('id', user.id)
        .single()

      const { data: studentData } = await supabase
        .from('student_profiles')
        .select('check_in_streak')
        .eq('id', user.id)
        .single()

      const ageRange = user.user_metadata?.age_range || '18plus'

      // Build general context — NO private data
      let context = `User context (general only — no private data):\n`
      context += `Age range: ${ageRange}\n`
      if (studentData?.check_in_streak) {
        context += `Check-in streak: ${studentData.check_in_streak} days\n`
      }
      if (data?.balance_boosters?.length > 0) {
        context += `Activities they enjoy: ${data.balance_boosters.slice(0, 3).join(', ')}\n`
      }
      if (data?.mood_triggers?.length > 0) {
        context += `Things that affect their mood: ${data.mood_triggers.slice(0, 2).join(', ')}\n`
      }
      context += `\nIMPORTANT: Never reference specific check-in scores, journal entries, or private data.`

      setUserContext(context)
    } catch (e) {
      console.log('Context error:', e)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setShowSuggestions(false)
    setLoading(true)

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true })
    }, 100)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 150,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'system', content: userContext },
            ...newMessages,
          ],
        }),
      })

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || "I'm here with you. Could you tell me a little more about how you're feeling?"

      const assistantMessage: Message = { role: 'assistant', content: reply }
      setMessages([...newMessages, assistantMessage])

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true })
      }, 100)

    } catch (e) {
      console.log('OpenAI error:', e)
      setMessages([...newMessages, {
        role: 'assistant',
        content: "I'm here with you. It seems something went wrong on my end — please try again in a moment.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tawazon Guide</Text>
          <View style={styles.onlineDot} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Privacy banner */}
      <View style={styles.privacyBanner}>
        <Text style={styles.privacyBannerText}>
          🔒 Conversations are not saved. Your private data is never shared.
        </Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Welcome message */}
          {messages.length === 0 && (
            <View style={styles.welcomeSection}>
              <View style={styles.welcomeAvatarWrap}>
                <Text style={styles.welcomeEmoji}>🌿</Text>
              </View>
              <Text style={styles.welcomeTitle}>Your Tawazon Guide</Text>
              <Text style={styles.welcomeSubtitle}>
                A safe, calm space to talk about how you're feeling. I'm here to listen and offer gentle support.
              </Text>
              <View style={styles.disclaimerCard}>
                <Text style={styles.disclaimerText}>
                  Your Guide offers wellbeing support — not medical advice. For serious concerns, please speak to a trusted adult or professional.
                </Text>
              </View>
            </View>
          )}

          {/* Chat messages */}
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {message.role === 'assistant' && (
                <Text style={styles.assistantLabel}>Tawazon Guide</Text>
              )}
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userText : styles.assistantText,
              ]}>
                {message.content}
              </Text>
            </View>
          ))}

          {/* Loading indicator */}
          {loading && (
            <View style={styles.loadingBubble}>
              <ActivityIndicator size="small" color="#4DB6AC" />
              <Text style={styles.loadingText}>Tawazon Guide is thinking...</Text>
            </View>
          )}

          {/* Suggested prompts */}
          {showSuggestions && messages.length === 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>What's on your mind?</Text>
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestedPrompt(prompt)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.suggestionText}>{prompt}</Text>
                  <Text style={styles.suggestionArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </Animated.View>
      </ScrollView>

      {/* Input area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Share how you're feeling..."
          placeholderTextColor="#C0C8D0"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!input.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          activeOpacity={0.85}
        >
          <Text style={styles.sendButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Footer note */}
      <Text style={styles.footerNote}>
        Not a substitute for professional support
      </Text>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: { width: 40 },
  backText: { fontSize: 14, color: '#4DB6AC', fontWeight: '600' },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#2E3A59', letterSpacing: -0.2 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4DB6AC',
  },
  privacyBanner: {
    backgroundColor: '#E8F8F6',
    paddingVertical: 9,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#C8EFEC',
  },
  privacyBannerText: {
    fontSize: 11,
    color: '#4DB6AC',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  messagesContainer: { flex: 1 },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  welcomeAvatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeEmoji: { fontSize: 40 },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  disclaimerCard: {
    backgroundColor: '#FFFBEF',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F0A500',
    width: '100%',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#7A4F00',
    lineHeight: 19,
    textAlign: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 10,
    borderRadius: 18,
    padding: 14,
  },
  userBubble: {
    backgroundColor: '#4DB6AC',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  assistantLabel: {
    fontSize: 10,
    color: '#4DB6AC',
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  messageText: { fontSize: 14, lineHeight: 22 },
  userText: { color: '#ffffff' },
  assistantText: { color: '#2E3A59' },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingText: { fontSize: 13, color: '#9BA3B0', fontStyle: 'italic' },
  suggestionsSection: { marginTop: 8 },
  suggestionsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9BA3B0',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  suggestionText: { fontSize: 14, color: '#2E3A59', flex: 1, lineHeight: 20 },
  suggestionArrow: { fontSize: 16, color: '#4DB6AC', fontWeight: '700' },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 11,
    fontSize: 14,
    color: '#2E3A59',
    maxHeight: 100,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4DB6AC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: { opacity: 0.4 },
  sendButtonText: { fontSize: 18, color: '#ffffff', fontWeight: '700' },
  footerNote: {
    fontSize: 10,
    color: '#C0C8D0',
    textAlign: 'center',
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
    letterSpacing: 0.2,
  },
})