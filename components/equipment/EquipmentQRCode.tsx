"use client"

import { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Printer } from "lucide-react"

interface EquipmentQRCodeProps {
  equipmentId: number
  equipmentName: string
  size?: number
}

export function EquipmentQRCode({ equipmentId, equipmentName, size = 256 }: EquipmentQRCodeProps) {
  const [qrData, setQrData] = useState("")

  useEffect(() => {
    // Generate QR code data
    const data = JSON.stringify({
      type: "equipment",
      id: equipmentId,
      name: equipmentName,
      url: `${window.location.origin}/admin/equipment/${equipmentId}`,
    })
    setQrData(data)
  }, [equipmentId, equipmentName])

  const handleDownload = () => {
    const svg = document.getElementById(`qr-code-${equipmentId}`)
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()
      
      img.onload = () => {
        canvas.width = size
        canvas.height = size
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.download = `equipment-${equipmentId}-qr.png`
        downloadLink.href = pngFile
        downloadLink.click()
      }
      
      img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Equipment QR Code - ${equipmentName}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 40px;
                border: 2px solid #ccc;
                border-radius: 10px;
              }
              h1 { margin-bottom: 10px; }
              p { color: #666; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>${equipmentName}</h1>
              <div id="qr"></div>
              <p>ID: ${equipmentId}</p>
              <p>Scan to view equipment details</p>
            </div>
          </body>
        </html>
      `)
      
      const qrContainer = printWindow.document.getElementById("qr")
      if (qrContainer) {
        qrContainer.innerHTML = document.getElementById(`qr-code-${equipmentId}`)?.outerHTML || ""
      }
      
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }
  }

  if (!qrData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG
            id={`qr-code-${equipmentId}`}
            value={qrData}
            size={size}
            level="H"
            includeMargin={true}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}