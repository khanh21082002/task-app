// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export const useAuth = () => {
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null)
    })
    return () => subscription?.unsubscribe()
  }, [])

  const handleAuth = async (email: string, password: string, isSignup: boolean) => {
    try {
      if (isSignup) {
        await supabase.auth.signInUp({ email, password })
      } else {
        await supabase.auth.signIn({ email, password })
      }
    } catch (error) {
      throw error
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
      })
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
    } catch (error) {
      throw error
    }
  }

  const fetchUserProfile = async () => {
    if (!session?.user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    setUserProfile(profile)
    return profile
  }

  return {
    session,
    userProfile,
    handleAuth,
    handleGoogleLogin,
    signOut,
    fetchUserProfile
  }
}