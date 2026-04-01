'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Download, Link } from 'lucide-react'

interface QRConfig {
  state: string
  slug: string
  url: string
  color: string
}

interface Props {
  configs: QRConfig[]
}

function QRCodeCard({ config }: { config: QRConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, config.url, {
        width: 220,
        margin: 2,
        color: {
          dark: config.color,
          light: '#ffffff',
        },
      })
    }
  }, [config.url, config.color])

  function downloadQR() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `RBM_QR_${config.state}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  function copyUrl() {
    navigator.clipboard.writeText(config.url)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <div
        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm mb-3"
        style={{ backgroundColor: config.color }}
      >
        {config.state.slice(0, 2).toUpperCase()}
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">{config.state}</h3>

      <div className="flex justify-center my-4">
        <canvas ref={canvasRef} className="rounded-lg border border-gray-100" />
      </div>

      <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4 text-xs text-gray-600 font-mono break-all">
        {config.url}
      </div>

      <div className="flex gap-2">
        <button
          onClick={downloadQR}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: config.color }}
        >
          <Download size={14} />
          Download PNG
        </button>
        <button
          onClick={copyUrl}
          title="Copy URL"
          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Link size={14} className="text-gray-600" />
        </button>
      </div>
    </div>
  )
}

export default function QRCodesClient({ configs }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {configs.map(config => (
        <QRCodeCard key={config.slug} config={config} />
      ))}
    </div>
  )
}
