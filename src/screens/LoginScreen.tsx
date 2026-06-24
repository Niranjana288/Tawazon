import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { supabase } from '../api/supabase'

export default function LoginScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const shakeAnim = useRef(new Animated.Value(0)).current

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

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

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  const pressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start()
  }

  const pressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password')
      shake()
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError('Incorrect email or password. Please try again.')
        shake()
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id)
          .single()
        if (profile?.role === 'parent') {
          navigation.navigate('ParentHome')
        } else {
          navigation.navigate('StudentHome')
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
      shake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>T</Text>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your Tawazon account</Text>
          </View>

          {error ? (
            <Animated.View
              style={[styles.errorBox, { transform: [{ translateX: shakeAnim }] }]}
            >
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="you@example.com"
              placeholderTextColor="#C0C8D0"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  passwordFocused && styles.inputFocused,
                ]}
                placeholder="Enter your password"
                placeholderTextColor="#C0C8D0"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPressIn={pressIn}
              onPressOut={pressOut}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={1}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerText}>
              New here?{' '}
              <Text style={styles.registerLink}>Create account</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              Your data is private and secure
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4DB6AC',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#9BA3B0',
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  errorText: {
    fontSize: 13,
    color: '#E05555',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2E3A59',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#2E3A59',
  },
  inputFocused: {
    borderColor: '#4DB6AC',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 70,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '500',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '500',
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
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECF0',
  },
  dividerText: {
    fontSize: 13,
    color: '#9BA3B0',
    marginHorizontal: 12,
  },
  registerButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    color: '#4DB6AC',
    fontWeight: '600',
  },
  privacyNote: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
  },
  privacyText: {
    fontSize: 12,
    color: '#4DB6AC',
    textAlign: 'center',
  },
})