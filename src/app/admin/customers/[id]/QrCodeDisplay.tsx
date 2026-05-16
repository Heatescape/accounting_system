'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

export default function QrCodeDisplay({ url, customerName }: { url: string; customerName: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function showQr() {
    const dataUrl = await QRCode.toDataURL(url, { width: 256, margin: 2 })
    setQrDataUrl(dataUrl)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={copyLink}
        className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
      >
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
      <button
        onClick={showQr}
        className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
      >
        QR Code
      </button>

      {qrDataUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setQrDataUrl(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-xl text-center"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-1">{customerName}</h3>
            <p className="text-gray-400 text-xs mb-4">Scan to view balance</p>
            <img src={qrDataUrl} alt="QR Code" className="mx-auto" />
            <button
              onClick={() => {
                const a = document.createElement('a')
                a.href = qrDataUrl
                a.download = `${customerName}-qr.png`
                a.click()
              }}
              className="mt-4 text-sm text-gray-500 underline"
            >
              Download PNG
            </button>
            <p className="mt-3 text-xs text-gray-400">Click outside to close</p>
          </div>
        </div>
      )}
    </div>
  )
}
