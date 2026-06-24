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

const TRIGGERS = [
  { id: 'school', label: 'School or studies', emoji: '🏫', color: '#FFF3E8', borderColor: '#F0A500' },
  { id: 'social_media', label: 'Social media', emoji: '📱', color: '#EDE9FF', borderColor: '#B39DDB' },
  { id: 'friendships', label: 'Friendships', emoji: '👥', color: '#E8F8F6', borderColor: '#4DB6AC' },
  { id: 'family', label: 'Family', emoji: '🏠', color: '#FCE8F0', borderColor: '#F48FB1' },
  { id: 'body_image', label: 'Body image', emoji: '🪞', color: '#E6F1FB', borderColor: '#4A90D9' },
  { id: 'future', label: 'Future worries', emoji: '🔮', color: '#F0F8FF', borderColor: '#4A90D9' },
  { id: 'multiple', label: 'Multiple factors', emoji: '🌀', color: '#F5F5F5', borderColor: '#9BA3B0' },
]

export default function MoodTriggerScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()
  }, [])

  const toggleTrigger = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleContinue = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ mood_triggers: selected })
          .eq('id', user.id)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setSaving(false)
      navigation.navigate('StudentHome')
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>One last thing</Text>
            </View>
            <Text style={styles.title}>What tends to affect your mood most?</Text>
            <Text style={styles.subtitle}>
              Select anything that feels relevant. This helps Tawazon personalize your experience.
            </Text>
          </View>

          {/* Trigger options */}
          <View style={styles.triggersGrid}>
            {TRIGGERS.map(trigger => {
              const isSelected = selected.includes(trigger.id)
              return (
                <TouchableOpacity
                  key={trigger.id}
                  style={[
                    styles.triggerCard,
                    { borderColor: isSelected ? trigger.borderColor : '#E8ECF0' },
                    isSelected && { backgroundColor: trigger.color },
                  ]}
                  onPress={() => toggleTrigger(trigger.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.triggerEmoji}>{trigger.emoji}</Text>
                  <Text style={[
                    styles.triggerLabel,
                    isSelected && { color: '#2E3A59', fontWeight: '600' },
                  ]}>
                    {trigger.label}
                  </Text>
                  {isSelected && (
                    <View style={[styles.checkDot, { backgroundColor: trigger.borderColor }]}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Privacy note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 This is private and never shared. It helps Tawazon support you better.
            </Text>
          </View>

          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.button,
              saving && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Saving...' : selected.length > 0 ? 'Continue' : 'Skip for now'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            You can always update this in your profile settings.
          </Text>

        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  stepBadge: {
    backgroundColor: '#E8F8F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  stepText: {
    fontSize: 12,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 10,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    lineHeight: 22,
  },
  triggersGrid: {
    gap: 10,
    marginBottom: 24,
  },
  triggerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8ECF0',
    gap: 12,
  },
  triggerEmoji: { fontSize: 22 },
  triggerLabel: {
    fontSize: 15,
    color: '#9BA3B0',
    flex: 1,
  },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  privacyNote: {
    backgroundColor: '#F0FAFA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 12,
    color: '#4DB6AC',
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 12,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 12,
    color: '#C0C8D0',
    textAlign: 'center',
  },
})