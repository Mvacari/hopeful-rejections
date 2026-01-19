'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthError = {
  message: string
  success?: boolean
} | null

async function authenticate(
  formData: FormData,
  isSignup: boolean
): Promise<AuthError> {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate inputs
    if (!email || !password) {
      console.error('Missing email or password')
      return { message: 'Email and password are required' }
    }

    console.log('Attempting authentication for:', email, 'isSignup:', isSignup)

    const data = {
      email: email.trim(),
      password: password,
    }

    const { error, data: authData } = isSignup
      ? await supabase.auth.signUp(data)
      : await supabase.auth.signInWithPassword(data)

    if (error) {
      console.error('Authentication error:', {
        message: error.message,
        status: error.status,
        name: error.name,
      })
      return { message: error.message || 'Authentication failed' }
    }

    if (!authData?.user) {
      console.error('No user data returned after authentication')
      return { message: 'Authentication failed: No user data received' }
    }

    // Verify session was created
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No session created after authentication')
      return { message: 'Authentication failed: Session not created. Please try again.' }
    }

    console.log('Authentication successful:', {
      email: authData.user.email,
      userId: authData.user.id,
      session: !!session,
      accessToken: !!session.access_token,
    })

    revalidatePath('/', 'layout')
    // Redirect directly - Next.js handles this properly even with useFormState
    // Note: redirect() throws a special error that Next.js catches - don't catch it here
    redirect('/dashboard')
  } catch (err: any) {
    // Check if this is a redirect error - if so, re-throw it
    if (err?.digest === 'NEXT_REDIRECT' || err?.message?.includes('NEXT_REDIRECT')) {
      throw err
    }
    console.error('Unexpected error during authentication:', err)
    return { message: err?.message || 'An unexpected error occurred' }
  }
}

export async function login(
  prevState: AuthError,
  formData: FormData
): Promise<AuthError> {
  return authenticate(formData, false)
}

export async function signup(
  prevState: AuthError,
  formData: FormData
): Promise<AuthError> {
  return authenticate(formData, true)
}

