'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

type Service = { id: string; name: string; price: number }

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('services')
      .select('id, name, price')
      .order('name')
    setServices(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: merchant } = await supabase.from('merchants').select('id').single()
    if (!merchant) { setError('Merchant not found.'); setLoading(false); return }

    const priceVal = parseFloat(price)
    if (isNaN(priceVal) || priceVal < 0) {
      setError('Please enter a valid price.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('services').insert({
      merchant_id: merchant.id,
      name: name.trim(),
      price: priceVal,
    })

    if (error) {
      setError(error.message)
    } else {
      setName('')
      setPrice('')
      load()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('services').delete().eq('id', id)
    load()
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-900 text-sm">← Customers</Link>
      </div>
      <h1 className="text-xl font-semibold mb-1">Services Menu</h1>
      <p className="text-gray-400 text-sm mb-6">
        Add your services here. When recording a transaction, select a service and the price fills in automatically.
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Service name"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <div className="relative w-28">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 shrink-0"
        >
          Add
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {services.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">No services yet. Add your first one above.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {services.map(s => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-gray-400">{formatCurrency(s.price)}</p>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
