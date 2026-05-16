'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

type Customer = { id: string; name: string; mobile: string }

function NewTransactionForm() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState('')
  const [type, setType] = useState<'topup' | 'consumption'>('consumption')
  const [amount, setAmount] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('customers').select('id, name, mobile').order('name')
      setCustomers(data ?? [])
      const preselect = searchParams.get('customerId')
      if (preselect) setCustomerId(preselect)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: merchant } = await supabase.from('merchants').select('id').single()
    if (!merchant) { setError('Could not find merchant account.'); setLoading(false); return }

    const amountVal = parseFloat(amount)
    if (isNaN(amountVal) || amountVal <= 0) {
      setError('Please enter a valid amount greater than 0.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('transactions').insert({
      customer_id: customerId,
      merchant_id: merchant.id,
      type,
      amount: amountVal,
      service_name: type === 'consumption' ? serviceName.trim() || null : null,
      notes: notes.trim() || null,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(customerId ? `/admin/customers/${customerId}` : '/admin')
      router.refresh()
    }
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-900 text-sm">← Customers</Link>
      </div>
      <h1 className="text-xl font-semibold mb-6">Record Transaction</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Customer</label>
          <select
            required
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
          >
            <option value="">Select customer…</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="flex gap-2">
            {(['consumption', 'topup'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  type === t
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t === 'consumption' ? 'Service / Consumption' : 'Top-up'}
              </button>
            ))}
          </div>
        </div>

        {type === 'consumption' && (
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input
              type="text"
              value={serviceName}
              onChange={e => setServiceName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g. Facial Treatment, Manicure"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Amount (AUD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
            <input
              type="number"
              required
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Any additional notes"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : type === 'topup' ? 'Record Top-up' : 'Record Service'}
        </button>
      </form>
    </div>
  )
}

export default function NewTransactionPage() {
  return (
    <Suspense>
      <NewTransactionForm />
    </Suspense>
  )
}
