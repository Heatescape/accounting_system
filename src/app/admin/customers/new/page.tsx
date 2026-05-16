'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCustomerPage() {
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [startingBalance, setStartingBalance] = useState('0')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: merchant } = await supabase.from('merchants').select('id').single()
    if (!merchant) { setError('Could not find merchant account.'); setLoading(false); return }

    const { error } = await supabase.from('customers').insert({
      merchant_id: merchant.id,
      name: name.trim(),
      mobile: mobile.trim(),
      starting_balance: parseFloat(startingBalance) || 0,
    })

    if (error) {
      setError(error.code === '23505' ? 'A customer with this mobile number already exists.' : error.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-900 text-sm">← Customers</Link>
      </div>
      <h1 className="text-xl font-semibold mb-6">Add Customer</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="e.g. Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mobile Number</label>
          <input
            type="tel"
            required
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="e.g. 0412 345 678"
          />
          <p className="text-xs text-gray-400 mt-1">Customers use this to log in and view their balance.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Starting Balance (AUD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={startingBalance}
            onChange={e => setStartingBalance(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <p className="text-xs text-gray-400 mt-1">
            If this customer already has credit with you, enter it here.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add Customer'}
        </button>
      </form>
    </div>
  )
}
