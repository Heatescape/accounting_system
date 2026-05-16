import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

async function getCustomersWithBalances(merchantId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, mobile, starting_balance, created_at')
    .eq('merchant_id', merchantId)
    .order('name')

  if (!customers) return []

  const { data: transactions } = await supabase
    .from('transactions')
    .select('customer_id, type, amount')
    .eq('merchant_id', merchantId)
    .eq('is_deleted', false)

  const balanceMap: Record<string, number> = {}
  for (const t of transactions ?? []) {
    if (!balanceMap[t.customer_id]) balanceMap[t.customer_id] = 0
    if (t.type === 'topup') balanceMap[t.customer_id] += Number(t.amount)
    else balanceMap[t.customer_id] -= Number(t.amount)
  }

  return customers.map(c => ({
    ...c,
    balance: Number(c.starting_balance) + (balanceMap[c.id] ?? 0),
  }))
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: merchant } = await supabase.from('merchants').select('id').single()

  if (!merchant) return <p>Merchant record not found. Please contact support.</p>

  const customers = await getCustomersWithBalances(merchant.id, supabase)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Customers</h1>
        <Link
          href="/admin/customers/new"
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700"
        >
          + Add Customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-2">No customers yet.</p>
          <Link href="/admin/customers/new" className="text-gray-900 underline text-sm">
            Add your first customer
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {customers.map(c => (
            <Link
              key={c.id}
              href={`/admin/customers/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-gray-400 text-xs">{c.mobile}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${c.balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(c.balance)}
                </p>
                <p className="text-gray-400 text-xs">balance</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-400 text-center">
        {customers.length} customer{customers.length !== 1 ? 's' : ''}
        {customers.length > 0 && (
          <> · Total deposits: {formatCurrency(customers.reduce((s, c) => s + Math.max(c.balance, 0), 0))}</>
        )}
      </div>
    </div>
  )
}
