import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import UndoButton from './UndoButton'
import QrCodeDisplay from './QrCodeDisplay'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: merchant } = await supabase.from('merchants').select('id').single()
  if (!merchant) notFound()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('merchant_id', merchant.id)
    .single()

  if (!customer) notFound()

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('customer_id', id)
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

  const customerUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/c/${merchant.id}?mobile=${encodeURIComponent(customer.mobile)}`

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin" className="text-gray-400 hover:text-gray-900 text-sm">← Customers</Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{customer.name}</h1>
          <p className="text-gray-400 text-sm">{customer.mobile}</p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-gray-400 text-xs">current balance</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <Link
          href={`/admin/transactions/new?customerId=${customer.id}`}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
        >
          Record Transaction
        </Link>
        <QrCodeDisplay url={customerUrl} customerName={customer.name} />
      </div>

      <h2 className="font-medium text-sm text-gray-500 mb-3 uppercase tracking-wide">
        Transaction History
      </h2>

      {rows.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">No transactions yet.</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {rows.slice().reverse().map(t => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {t.type === 'topup' ? '↑ Top-up' : t.service_name || 'Service'}
                </p>
                <p className="text-xs text-gray-400">{formatDateTime(t.created_at)}</p>
                {t.notes && <p className="text-xs text-gray-400 italic">{t.notes}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${t.delta > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {t.delta > 0 ? '+' : ''}{formatCurrency(t.delta)}
                </p>
                <p className="text-xs text-gray-400">bal. {formatCurrency(t.balanceAfter)}</p>
              </div>
              <UndoButton transactionId={t.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
