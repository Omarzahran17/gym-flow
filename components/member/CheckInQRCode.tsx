"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Smartphone, Download, Share2 } from "lucide-react"

interface CheckInQRCodeProps {
    qrCode: string
    memberName: string
}

export function CheckInQRCode({ qrCode, memberName }: CheckInQRCodeProps) {
    const [open, setOpen] = useState(false)

    const downloadQRCode = () => {
        const svg = document.getElementById("member-qr-code")
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width + 40
            canvas.height = img.height + 120
            if (!ctx) return

            // Draw background
            ctx.fillStyle = "white"
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw QR Code
            ctx.drawImage(img, 20, 20)

            // Draw Text
            ctx.fillStyle = "black"
            ctx.font = "bold 20px sans-serif"
            ctx.textAlign = "center"
            ctx.fillText("GymFlow Check-In", canvas.width / 2, img.height + 60)

            ctx.font = "16px sans-serif"
            ctx.fillStyle = "#666"
            ctx.fillText(memberName, canvas.width / 2, img.height + 90)

            const pngFile = canvas.toDataURL("image/png")
            const downloadLink = document.createElement("a")
            downloadLink.download = `gym-check-in-${memberName.replace(/\s+/g, '-').toLowerCase()}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                    <QrCode className="h-4 w-4 mr-2" />
                    Check-In QR
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">Your Check-In Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-8 py-6">
                    <div className="p-6 bg-white rounded-3xl shadow-xl border border-zinc-100 flex items-center justify-center">
                        <QRCodeSVG
                            id="member-qr-code"
                            value={qrCode}
                            size={240}
                            level="H"
                            includeMargin={false}
                            className="rounded-lg"
                        />
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">{memberName}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Scan this code at the front desk to check in</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button
                            variant="outline"
                            onClick={downloadQRCode}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Save Image
                        </Button>
                        <Button
                            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 flex items-center gap-2"
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: 'GymFlow Check-In Code',
                                        text: 'My GymFlow check-in QR code',
                                        url: window.location.href
                                    }).catch(console.error);
                                }
                            }}
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </Button>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <Smartphone className="h-3 w-3" />
                    <span>Keep this handy for quick entry</span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
