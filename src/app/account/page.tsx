import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import LogoutButton from './LogoutButton'

export default async function AccountPage() {
  const cookieStore = await cookies()
  const raw = cookieStore.get('customer_session')?.value

  if (!raw) redirect('/login-required')

  let session: { customerId: string; merchantId: string }
  try {
    session = JSON.parse(raw)
  } catch {
    redirect('/login-required')
  }

  const supabase = await createServiceClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, mobile, starting_balance, merchant_id')
    .eq('id', session.customerId)
    .eq('merchant_id', session.merchantId)
    .single()

  if (!customer) redirect('/login-required')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('business_name')
    .eq('id', session.merchantId)
    .single()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('id, type, amount, service_name, notes, created_at')
    .eq('customer_id', customer.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  // Compute running balance
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">{merchant?.business_name}</p>
            <h1 className="font-semibold text-gray-900">{customer.name}</h1>
          </div>
          <LogoutButton merchantId={session.merchantId} />
        </div>

        {/* Balance card */}
        <div className="bg-gray-900 text-white rounded-2xl p-6 mb-6">
          <p className="text-gray-400 text-sm mb-1">Current Balance</p>
          <p className={`text-4xl font-bold ${balance < 0 ? 'text-red-400' : 'text-white'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-gray-500 text-xs mt-3">AUD · Updated in real time</p>
        </div>

        {/* Transactions */}
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Transaction History
        </h2>

        {rows.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No transactions yet.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {rows.slice().reverse().map(t => (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {t.type === 'topup' ? '↑ Top-up' : t.service_name || 'Service'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(t.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${t.delta > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {t.delta > 0 ? '+' : ''}{formatCurrency(t.delta)}
                  </p>
                  <p className="text-xs text-gray-400">bal. {formatCurrency(t.balanceAfter)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
