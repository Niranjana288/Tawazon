import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

export default function ParentHomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👨‍👩‍👧</Text>
      <Text style={styles.title}>Parent Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to your parent view</Text>
      <Text style={styles.description}>
        Monitor your child's wellbeing journey with summaries and gentle insights — while respecting their privacy.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ParentDashboard')}
      >
        <Text style={styles.buttonText}>Go to dashboard</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4DB6AC',
    fontWeight: '500',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#9BA3B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#4DB6AC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
})