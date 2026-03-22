'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    setLoading(true)
    router.push('/instructions')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-medium">Disclosure Study</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Complete a short insurance claim interaction with an AI adjuster. Some details are sensitive and should not be disclosed.
        </p>
        <Link href="/instructions">
          <button className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-gray-200 transition mt-4">
            Start Study
          </button>
        </Link>
      </div>
    </main>
  )
}