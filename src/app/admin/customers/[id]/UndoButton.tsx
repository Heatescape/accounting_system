'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UndoButton({ transactionId }: { transactionId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUndo() {
    if (!confirming) { setConfirming(true); return }
    setLoading(true)
    await fetch(`/api/transactions/${transactionId}/undo`, { method: 'POST' })
    router.refresh()
    setLoading(false)
    setConfirming(false)
  }

  return (
    <button
      onClick={handleUndo}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded border shrink-0 transition-colors ${
        confirming
          ? 'border-red-400 text-red-600 hover:bg-red-50'
          : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600'
      }`}
    >
      {loading ? '…' : confirming ? 'Confirm?' : 'Undo'}
    </button>
  )
}
