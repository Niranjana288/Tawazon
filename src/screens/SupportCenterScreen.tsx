import { useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Linking,
} from 'react-native'

export default function SupportCenterScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Opening */}
          <View style={styles.openingCard}>
            <Text style={styles.openingEmoji}>🌿</Text>
            <Text style={styles.openingTitle}>You are not alone</Text>
            <Text style={styles.openingText}>
              Whatever you are going through, real human support is available. Reaching out is one of the bravest things you can do.
            </Text>
          </View>

          {/* Talk to someone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Talk to someone</Text>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceEmoji}>🏫</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>School counselor</Text>
                <Text style={styles.resourceDesc}>
                  The most accessible first step for teens. Your school counselor is trained to listen and support you confidentially.
                </Text>
              </View>
            </View>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceEmoji}>📞</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Emirates Health Services</Text>
                <Text style={styles.resourceDesc}>
                  Professional support available in the UAE.
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('tel:80011111')}
                  style={styles.callButton}
                >
                  <Text style={styles.callButtonText}>Call 800-11111</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceEmoji}>🏥</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>Ministry of Health UAE</Text>
                <Text style={styles.resourceDesc}>
                  Mental health and wellbeing support services.
                </Text>
                <TouchableOpacity
                  onPress={() => Linking.openURL('tel:80011111')}
                  style={styles.callButton}
                >
                  <Text style={styles.callButtonText}>Call 800-11111</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resourceCard}>
              <Text style={styles.resourceEmoji}>🏠</Text>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceTitle}>A trusted adult at home</Text>
                <Text style={styles.resourceDesc}>
                  A parent, guardian, or family member you feel safe with. Sometimes the first step is simply telling someone you trust that things feel hard.
                </Text>
              </View>
            </View>
          </View>

          {/* If you need help right now */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>If you need help right now</Text>
            <View style={styles.urgentCard}>
              <Text style={styles.urgentText}>
                If you are in crisis or need immediate support, please reach out to a trusted adult or call emergency services.
              </Text>
              <TouchableOpacity
                style={styles.urgentButton}
                onPress={() => Linking.openURL('tel:998')}
                activeOpacity={0.85}
              >
                <Text style={styles.urgentButtonText}>Emergency: 998</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* For parents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>For parents and guardians</Text>
            <View style={styles.parentCard}>
              <Text style={styles.parentText}>
                If you are concerned about your child, trust your instincts. Starting a gentle, non-judgmental conversation — not about behaviors but about how they are feeling — is always a positive first step.
              </Text>
              <Text style={styles.parentText}>
                School counselors and healthcare professionals in the UAE can provide guidance on how to support a young person who may be struggling emotionally.
              </Text>
            </View>
          </View>

          {/* Tawazon reminder */}
          <View style={styles.tawazonNote}>
            <Text style={styles.tawazonNoteTitle}>About Tawazon</Text>
            <Text style={styles.tawazonNoteText}>
              Tawazon is a wellbeing companion — not a medical tool. It does not diagnose conditions or replace professional care. If you or someone you know needs specialized support, please reach out to a qualified professional.
            </Text>
          </View>

          {/* Privacy */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 Everything in Tawazon is private. Seeking support is always your choice.
            </Text>
          </View>
          {/* ED specific support */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>
    Eating and body image support
  </Text>

  <View style={styles.resourceCard}>
    <Text style={styles.resourceEmoji}>🌸</Text>
    <View style={styles.resourceInfo}>
      <Text style={styles.resourceTitle}>Beat Eating Disorders</Text>
      <Text style={styles.resourceDesc}>
        Helpline with international reach. Online chat and phone support available.
      </Text>
      <TouchableOpacity
        style={styles.callButton}
        onPress={() => Linking.openURL('https://www.beateatingdisorders.org.uk')}
      >
        <Text style={styles.callButtonText}>Visit website</Text>
      </TouchableOpacity>
    </View>
  </View>

  <View style={styles.resourceCard}>
    <Text style={styles.resourceEmoji}>🤝</Text>
    <View style={styles.resourceInfo}>
      <Text style={styles.resourceTitle}>ANAD Helpline</Text>
      <Text style={styles.resourceDesc}>
        Free support, resources and recovery groups for anyone struggling with food or body image.
      </Text>
      <TouchableOpacity
        style={styles.callButton}
        onPress={() => Linking.openURL('https://anad.org/get-help/')}
      >
        <Text style={styles.callButtonText}>Visit website</Text>
      </TouchableOpacity>
    </View>
  </View>

  <View style={styles.resourceCard}>
    <Text style={styles.resourceEmoji}>🏥</Text>
    <View style={styles.resourceInfo}>
      <Text style={styles.resourceTitle}>School nurse or GP</Text>
      <Text style={styles.resourceDesc}>
        If food or body image thoughts are causing distress, a school nurse or GP is a safe first step. You do not need to have all the answers before reaching out.
      </Text>
    </View>
  </View>
</View>
          
       </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
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
  backButton: { width: 40 },
  backText: { fontSize: 14, color: '#4DB6AC', fontWeight: '500' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#2E3A59' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  openingCard: {
    backgroundColor: '#F0FAFA',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  openingEmoji: { fontSize: 36, marginBottom: 12 },
  openingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
    textAlign: 'center',
  },
  openingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BA3B0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  resourceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  resourceEmoji: { fontSize: 24, marginTop: 2 },
  resourceInfo: { flex: 1 },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  callButton: {
    backgroundColor: '#E8F8F6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: '#4DB6AC',
  },
  callButtonText: {
    fontSize: 13,
    color: '#4DB6AC',
    fontWeight: '600',
  },
  urgentCard: {
    backgroundColor: '#2E3A59',
    borderRadius: 16,
    padding: 18,
  },
  urgentText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: 14,
  },
  urgentButton: {
    backgroundColor: '#4DB6AC',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
  },
  urgentButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  parentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  parentText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  tawazonNote: {
    backgroundColor: '#FFF8E8',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F0A500',
  },
  tawazonNoteTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#854F0B',
    marginBottom: 6,
  },
  tawazonNoteText: {
    fontSize: 12,
    color: '#854F0B',
    lineHeight: 18,
  },
  privacyNote: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
  },
  privacyText: {
    fontSize: 11,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 18,
  },
})