import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: merchant } = await supabase
    .from('merchants')
    .select('business_name')
    .single()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold text-gray-900 text-sm">
              {merchant?.business_name ?? 'Balance Tracker'}
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Customers
              </Link>
              <Link href="/admin/transactions/new" className="text-gray-600 hover:text-gray-900">
                New Transaction
              </Link>
              <Link href="/admin/services" className="text-gray-600 hover:text-gray-900">
                Services
              </Link>
            </nav>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
