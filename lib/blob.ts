import { put, del } from '@vercel/blob';

export async function uploadVideo(file: File, path: string) {
  const blob = await put(path, file, {
    access: 'public',
    contentType: file.type,
  });
  return blob;
}

export async function uploadImage(file: File, path: string) {
  const blob = await put(path, file, {
    access: 'public',
    contentType: file.type,
  });
  return blob;
}

export async function deleteBlob(url: string) {
  await del(url);
}

export function generateVideoPath(memberId: number, exerciseId: number, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `videos/member-${memberId}/exercise-${exerciseId}/${timestamp}-${sanitizedFilename}`;
}

export function generatePhotoPath(memberId: number, type: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `photos/member-${memberId}/${type}/${timestamp}-${sanitizedFilename}`;
}
