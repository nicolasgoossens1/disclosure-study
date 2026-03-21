import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-3xl font-medium">Disclosure Study</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          You will be given a secret identity. Chat with an AI 
          for 5 minutes. Try not to reveal who you are.
        </p>
        <Link href="/chat">
          <button className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-gray-200 transition mt-4">
            Start Session
          </button>
        </Link>
      </div>
    </main>
  )
}