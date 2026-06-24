import { useRef, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { supabase } from '../api/supabase'

export default function RoleSelectionScreen({ navigation, route }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(40)).current
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const ageRange = route.params?.ageRange || '18plus'
  const isMinor = ageRange === 'under13' || ageRange === '13to17'

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

  const handleContinue = async () => {
    if (!selectedRole) {
      setError('Please select an option to continue')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            role: selectedRole,
            full_name: user.user_metadata?.full_name || '',
          })
        if (error) {
          setError('Something went wrong. Please try again.')
        } else {
          if (selectedRole === 'student') {
            navigation.navigate('RiskAssessment')
          } else {
            navigation.navigate('ParentHome')
          }
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>T</Text>
          </View>
          <Text style={styles.title}>Who are you using{'\n'}Tawazon for?</Text>
          <Text style={styles.subtitle}>
            This helps us give you the right experience
          </Text>
        </View>

        {/* Myself card — always shown */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            selectedRole === 'student' && styles.roleCardSelected,
          ]}
          onPress={() => setSelectedRole('student')}
          activeOpacity={0.85}
        >
          <View style={[
            styles.roleIconCircle,
            selectedRole === 'student' && styles.roleIconCircleSelected,
          ]}>
            <Text style={styles.roleIcon}>🙋</Text>
          </View>
          <View style={styles.roleTextContainer}>
            <Text style={[
              styles.roleTitle,
              selectedRole === 'student' && styles.roleTitleSelected,
            ]}>
              Myself
            </Text>
            <Text style={styles.roleDescription}>
              {isMinor
                ? 'Track your own wellbeing. A parent can connect to support you.'
                : 'Track your own wellbeing privately. Full privacy, no one else has access.'}
            </Text>
          </View>
          <View style={[
            styles.radioOuter,
            selectedRole === 'student' && styles.radioOuterSelected,
          ]}>
            {selectedRole === 'student' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* My child card — only shown for 18+ */}
        {!isMinor && (
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'parent' && styles.roleCardSelected,
            ]}
            onPress={() => setSelectedRole('parent')}
            activeOpacity={0.85}
          >
            <View style={[
              styles.roleIconCircle,
              selectedRole === 'parent' && styles.roleIconCircleSelected,
            ]}>
              <Text style={styles.roleIcon}>👨‍👩‍👧</Text>
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={[
                styles.roleTitle,
                selectedRole === 'parent' && styles.roleTitleSelected,
              ]}>
                My child
              </Text>
              <Text style={styles.roleDescription}>
                Monitor your child's wellbeing. You will see summaries only — never private entries.
              </Text>
            </View>
            <View style={[
              styles.radioOuter,
              selectedRole === 'parent' && styles.radioOuterSelected,
            ]}>
              {selectedRole === 'parent' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        )}

        {/* Info note for minors */}
        {isMinor && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              If your parent would like to stay connected with your journey, they can download Tawazon and create their own account.
            </Text>
          </View>
        )}

        {/* Privacy note */}
        <View style={styles.privacyNote}>
  <Text style={styles.privacyText}>
    {isMinor
      ? 'Your privacy is always protected. Parents see summaries only — never your private entries.'
      : 'Your data is completely private. No one else has access to your account.'}
  </Text>
</View>

        {/* Error */}
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Continue button */}
        <TouchableOpacity
          style={[
            styles.button,
            !selectedRole && styles.buttonDisabled,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

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
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8ECF0',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  roleCardSelected: {
    borderColor: '#4DB6AC',
    backgroundColor: '#F0FAFA',
  },
  roleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleIconCircleSelected: {
    backgroundColor: '#E8F8F6',
  },
  roleIcon: {
    fontSize: 24,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  roleTitleSelected: {
    color: '#4DB6AC',
  },
  roleDescription: {
    fontSize: 12,
    color: '#9BA3B0',
    lineHeight: 18,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E8ECF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioOuterSelected: {
    borderColor: '#4DB6AC',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4DB6AC',
  },
  infoBox: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4DB6AC',
  },
  infoText: {
    fontSize: 12,
    color: '#4DB6AC',
    lineHeight: 18,
  },
  privacyNote: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  privacyText: {
    fontSize: 12,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorText: {
    fontSize: 13,
    color: '#E05555',
    textAlign: 'center',
    marginBottom: 12,
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
    opacity: 0.5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})