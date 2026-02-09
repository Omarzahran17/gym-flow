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

    let blob;
    if (type === "video") {
      blob = await uploadVideo(file, path);
    } else {
      blob = await uploadImage(file, path);
    }

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
