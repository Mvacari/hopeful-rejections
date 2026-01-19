import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Redirect to login page
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  return NextResponse.redirect(`${origin}/login`)
}
