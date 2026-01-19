'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AuthError = {
  message: string
  success?: boolean
} | null

async function authenticate(
  formData: FormData,
  isSignup: boolean
): Promise<AuthError> {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = isSignup
    ? await supabase.auth.signUp(data)
    : await supabase.auth.signInWithPassword(data)

  if (error) {
    return { message: error.message }
  }

  revalidatePath('/', 'layout')
  return { message: '', success: true }
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

