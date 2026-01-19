import { redirect } from 'next/navigation'

export default function AuthPage() {
  // Redirect old auth page to new login page
  redirect('/login')
}
