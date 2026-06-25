import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native'

export default function SplashScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  const content = {
    en: {
      tagline: 'Balance. Heal. Thrive.',
      getStarted: 'Get Started',
      disclaimer: 'Not a medical service · For support only',
    },
    ar: {
      tagline: 'توازن. شفاء. ازدهار.',
      getStarted: 'ابدأ الآن',
      disclaimer: 'ليست خدمة طبية · للدعم فقط',
    },
  }

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: true,
    }).start()
  }, [])

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Language Toggle */}
      <View style={styles.languageBar}>
        <TouchableOpacity
          style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
          onPress={() => setLanguage('en')}
        >
          <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langBtn, language === 'ar' && styles.langBtnActive]}
          onPress={() => setLanguage('ar')}
        >
          <Text style={[styles.langText, language === 'ar' && styles.langTextActive]}>AR</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Tagline */}
      <Text style={styles.tagline}>{content[language].tagline}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>{content[language].disclaimer}</Text>

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Disclaimer')}
      >
        <Text style={styles.buttonText}>{content[language].getStarted}</Text>
      </TouchableOpacity>

    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  languageBar: {
    position: 'absolute',
    top: 56,
    right: 24,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 3,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8ECF0',
  },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  langBtnActive: {
    backgroundColor: '#4DB6AC',
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9BA3B0',
    letterSpacing: 0.5,
  },
  langTextActive: {
    color: '#ffffff',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 16,
    color: '#4DB6AC',
    letterSpacing: 3,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: '#B39DDB',
    borderRadius: 2,
    marginBottom: 14,
    opacity: 0.7,
  },
  disclaimer: {
    fontSize: 12,
    color: '#C0C8D0',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 18,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
})
