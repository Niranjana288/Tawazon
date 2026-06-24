import { createClient } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(key))
    }
    return SecureStore.getItemAsync(key)
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value)
      return Promise.resolve()
    }
    return SecureStore.setItemAsync(key, value)
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key)
      return Promise.resolve()
    }
    return SecureStore.deleteItemAsync(key)
  },
}

export const supabase = createClient(
  'https://jemuwdebupjpeqbofetm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplbXV3ZGVidXBqcGVxYm9mZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODg0NDksImV4cCI6MjA5NzQ2NDQ0OX0.a1dnH7g898qPzYonUS-0WslERbjq79qTkzuqSVf8x7Y',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)