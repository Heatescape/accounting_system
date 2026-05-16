'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton({ merchantId }: { merchantId: string }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/customer-logout', { method: 'POST' })
    router.push(`/c/${merchantId}`)
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-400 hover:text-gray-700"
    >
      Sign out
    </button>
  )
}
