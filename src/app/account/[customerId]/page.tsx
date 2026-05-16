import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function CustomerAccountPage({
  params,
}: {
  params: Promise<{ customerId: string }>
}) {
  const { customerId } = await params
  const supabase = await createServiceClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, mobile, starting_balance, merchant_id')
    .eq('id', customerId)
    .single()

  if (!customer) notFound()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('business_name')
    .eq('id', customer.merchant_id)
    .single()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, type, amount, service_name, notes, created_at')
    .eq('customer_id', customer.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  // Running balance
  let running = Number(customer.starting_balance)
  const rows = (transactions ?? []).map(t => {
    const delta = t.type === 'topup' ? Number(t.amount) : -Number(t.amount)
    running += delta
    return { ...t, delta, balanceAfter: running }
  })
  const balance = running

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            {merchant?.business_name}
          </p>
          <h1 className="font-semibold text-gray-900 text-lg">{customer.name}</h1>
        </div>

        {/* Balance card */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-sm mb-1">Current Balance</p>
          <p className={`text-4xl font-bold tracking-tight ${balance < 0 ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-gray-500 text-xs mt-3">AUD · Updated in real time</p>
        </div>

        {/* Transactions */}
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Transaction History
        </h2>

        {rows.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No transactions yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {rows.slice().reverse().map(t => (
              <div key={t.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {t.type === 'topup' ? '↑ Top-up' : t.service_name || 'Service'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(t.created_at)}</p>
                    {t.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5">{t.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${t.delta > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {t.delta > 0 ? '+' : ''}{formatCurrency(t.delta)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">bal. {formatCurrency(t.balanceAfter)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
