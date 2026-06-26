import { supabase } from '../api/supabase'

export async function getUserFlags(): Promise<{
  riskLevel: 'low' | 'moderate' | 'high'
  edFlag: boolean
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { riskLevel: 'low', edFlag: false }
    const { data } = await supabase
      .from('student_profiles')
      .select('risk_level, ed_flag')
      .eq('id', user.id)
      .single()
    return {
      riskLevel: data?.risk_level || 'low',
      edFlag: data?.ed_flag || false,
    }
  } catch {
    return { riskLevel: 'low', edFlag: false }
  }
}