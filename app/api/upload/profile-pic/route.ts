import { uploadImage } from "@/lib/blob"
import { NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let file: File | null = null
  
  try {
    try {
      const formData = await request.formData()
      file = formData.get("file") as File
    } catch (formError) {
      console.error("FormData parse error:", formError)
      return NextResponse.json(
        { error: "Failed to parse form data" },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WEBP, GIF" },
        { status: 400 }
      )
    }

    // Check file size (5MB limit)
    const maxSizeMB = 5
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return NextResponse.json(
        { error: `File too large: ${sizeMB.toFixed(2)}MB. Maximum size is ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    const path = `profile-pics/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    console.log("Uploading profile picture:", file.name, "size:", sizeMB.toFixed(2), "MB")

    let blob
    try {
      blob = await uploadImage(file, path)
    } catch (uploadError) {
      console.error("Blob upload error:", uploadError)
      return NextResponse.json(
        { error: uploadError instanceof Error ? uploadError.message : "Failed to upload to blob storage" },
        { status: 500 }
      )
    }

    console.log("Upload successful:", blob.url)

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    )
  }
}
