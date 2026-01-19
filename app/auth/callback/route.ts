import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // No auth callbacks needed - redirect to auth page
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  return NextResponse.redirect(`${origin}/auth`)
}
