import { auth } from "@/lib/auth";
import { uploadVideo, uploadImage } from "@/lib/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const path = formData.get("path") as string;
    const type = formData.get("type") as "video" | "image";

    if (!file || !path) {
      return NextResponse.json(
        { error: "File and path are required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const isVideo = allowedVideoTypes.includes(file.type);
    const isImage = allowedImageTypes.includes(file.type);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: MP4, WebM, QuickTime, JPEG, PNG, WEBP` },
        { status: 400 }
      );
    }

    // Check file size (100MB limit)
    const maxSizeMB = 100;
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return NextResponse.json(
        { error: `File too large: ${sizeMB.toFixed(2)}MB. Maximum size is ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    console.log("Uploading video:", file.name, "size:", sizeMB.toFixed(2), "MB");

    let blob;
    if (type === "video") {
      blob = await uploadVideo(file, path);
    } else {
      blob = await uploadImage(file, path);
    }

    console.log("Upload successful:", blob.url);

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload file. Please try again." },
      { status: 500 }
    );
  }
}
