'use client'

import { useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function CustomerLoginForm({ merchantId }: { merchantId: string }) {
  const [mobile, setMobile] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Pre-fill mobile if passed via QR code URL
  const prefilled = searchParams.get('mobile')
  useState(() => { if (prefilled) setMobile(prefilled) })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/customer-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobile.trim(), merchantId }),
    })

    if (res.ok) {
      router.push('/account')
    } else {
      const { error } = await res.json()
      setError(error ?? 'Mobile number not found. Please check with your service provider.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-xl font-semibold mb-1">View Your Balance</h1>
        <p className="text-gray-400 text-sm mb-6">Enter your mobile number to see your account.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g. 0412 345 678"
              autoFocus
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'View My Balance'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function CustomerLoginPage({
  params,
}: {
  params: Promise<{ merchantId: string }>
}) {
  const { merchantId } = use(params)
  return (
    <Suspense>
      <CustomerLoginForm merchantId={merchantId} />
    </Suspense>
  )
}
