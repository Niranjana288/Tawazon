import { useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native'

export default function DisclaimerScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>*</Text>
        </View>

        <Text style={styles.title}>Before you begin</Text>
        <Text style={styles.subtitle}>Please read this carefully</Text>

        <View style={styles.card}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>1</Text>
          </View>
          <Text style={styles.cardTitle}>Support tool, not medical advice</Text>
          <Text style={styles.cardText}>
            Tawazon is a wellbeing support tool designed to help you track your emotional health. It is not a medical device and does not provide clinical diagnosis or treatment.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>2</Text>
          </View>
          <Text style={styles.cardTitle}>Your privacy is protected</Text>
          <Text style={styles.cardText}>
            Your journal entries and personal check-ins are private to you. Parents only see summaries - never your private words.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>3</Text>
          </View>
          <Text style={styles.cardTitle}>In a crisis?</Text>
          <Text style={styles.cardText}>
            If you or someone you know is in immediate danger, please contact a qualified healthcare professional or emergency services immediately. Tawazon is not a crisis service.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>4</Text>
          </View>
          <Text style={styles.cardTitle}>Designed for wellbeing</Text>
          <Text style={styles.cardText}>
            Tawazon is designed to support early awareness of emotional patterns and encourage healthy habits. It is a companion - not a replacement for professional care.
          </Text>
        </View>

        <Text style={styles.agreementText}>
          By continuing, you acknowledge that Tawazon is a support tool only and agree to use it responsibly.
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>I Understand - Continue</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    height: '100vh',
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
    height: '100%',
    overflow: 'scroll',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 36,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#9BA3B0',
    marginBottom: 28,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    width: '100%',
    shadowColor: '#B39DDB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  cardBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F8F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4DB6AC',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  agreementText: {
    fontSize: 12,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSpace: {
    height: 40,
  },
})