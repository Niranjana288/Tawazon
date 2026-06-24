import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { supabase } from '../api/supabase'

export default function LinkParentScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [codeFocused, setCodeFocused] = useState(false)

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

  const handleLink = async () => {
    if (!code.trim()) {
      setError('Please enter the invite code')
      return
    }
    if (code.trim().length !== 6) {
      setError('Invite code must be 6 characters')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Find the invite code
      const { data: link } = await supabase
        .from('parent_child_links')
        .select('id, parent_id, status')
        .eq('invite_code', code.trim().toUpperCase())
        .single()

      if (!link) {
        setError('Invalid invite code. Please check and try again.')
        return
      }

      if (link.status === 'active') {
        setError('This code has already been used.')
        return
      }

      // Link the student to the parent
      const { error: updateError } = await supabase
        .from('parent_child_links')
        .update({
          student_id: user.id,
          status: 'active',
          linked_at: new Date().toISOString(),
        })
        .eq('id', link.id)

      if (updateError) {
        setError('Something went wrong. Please try again.')
        return
      }

      setSuccess(true)

    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
        <Animated.View style={[styles.successContent, { opacity: fadeAnim }]}>
          <Text style={styles.successEmoji}>🌿</Text>
          <Text style={styles.successTitle}>Successfully linked!</Text>
          <Text style={styles.successSubtitle}>
            Your parent can now see your wellbeing summaries. Your private entries remain yours alone.
          </Text>
          <View style={styles.privacyCard}>
            <Text style={styles.privacyCardTitle}>What your parent can see</Text>
            <Text style={styles.privacyCardItem}>Mood trends (not details)</Text>
            <Text style={styles.privacyCardItem}>Weekly summaries</Text>
            <Text style={styles.privacyCardItem}>Gentle insights</Text>
            <Text style={styles.privacyCardDivider}>What stays private</Text>
            <Text style={styles.privacyCardItem}>Your journal entries</Text>
            <Text style={styles.privacyCardItem}>Your check-in notes</Text>
            <Text style={styles.privacyCardItem}>Your personal reflections</Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('StudentHome')}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Back to home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    )
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
        <Text style={styles.headerTitle}>Link to parent</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>Enter your parent's invite code</Text>
        <Text style={styles.subtitle}>
          Ask your parent to open Tawazon and share their 6-character invite code with you.
        </Text>

        <View style={styles.codeInputContainer}>
          <TextInput
            style={[
              styles.codeInput,
              codeFocused && styles.codeInputFocused,
            ]}
            placeholder="e.g. 4C7BE9"
            placeholderTextColor="#C0C8D0"
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            onFocus={() => setCodeFocused(true)}
            onBlur={() => setCodeFocused(false)}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            (!code.trim() || loading) && styles.buttonDisabled,
          ]}
          onPress={handleLink}
          disabled={!code.trim() || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Link accounts</Text>
          )}
        </TouchableOpacity>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            Your journal and private entries will never be shared with your parent. They only see summaries.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

      </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    lineHeight: 22,
    marginBottom: 32,
  },
  codeInputContainer: {
    marginBottom: 16,
  },
  codeInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E8ECF0',
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 24,
    color: '#2E3A59',
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  codeInputFocused: {
    borderColor: '#4DB6AC',
  },
  errorText: {
    fontSize: 13,
    color: '#E05555',
    textAlign: 'center',
    marginBottom: 16,
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
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  privacyNote: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  privacyNoteText: {
    fontSize: 12,
    color: '#4DB6AC',
    lineHeight: 18,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 13,
    color: '#9BA3B0',
  },
  successContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  successEmoji: {
    fontSize: 56,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  privacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    marginBottom: 28,
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  privacyCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4DB6AC',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  privacyCardItem: {
    fontSize: 13,
    color: '#2E3A59',
    marginBottom: 6,
    paddingLeft: 8,
  },
  privacyCardDivider: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B39DDB',
    marginTop: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})