import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    { error: 'Creator search is not available.' },
    { status: 501 }
  )
}

