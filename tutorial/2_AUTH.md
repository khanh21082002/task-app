// hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export const useAuth = () => {
  // State to store the current session and user profile
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)

  useEffect(() => {
    // Function to get the initial session when component mounts
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSession()
    
    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session ?? null)
    })
    // Cleanup subscription when component unmounts
    return () => subscription?.unsubscribe()
  }, [])

  // Handle both signup and login with email/password
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

  // Handle Google OAuth login
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

  // Handle logout and clear session
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
    } catch (error) {
      throw error
    }
  }

  // Fetch user profile from database
  const fetchUserProfile = async () => {
    if (!session?.user) return null

    // Query profiles table for user's profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    setUserProfile(profile)
    return profile
  }

  // Return all auth-related state and functions
  return {
    session,
    userProfile,
    handleAuth,
    handleGoogleLogin,
    signOut,
    fetchUserProfile
  }
}