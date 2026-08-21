import { v2 as cloudinary } from 'cloudinary'
import { config } from '../config.js'

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
})

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    config.cloudinary.cloudName &&
      config.cloudinary.apiKey &&
      config.cloudinary.apiSecret,
  )
}

/** Uploads an in-memory image buffer (e.g. from a multipart upload). */
export function uploadImageBuffer(buffer: Buffer, folder = 'stayly'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(
            Object.assign(
              new Error(error?.message ?? 'Cloudinary upload failed'),
              { statusCode: 502 },
            ),
          )
          return
        }
        resolve(result.secure_url)
      },
    )
    stream.end(buffer)
  })
}

/** Uploads an image already hosted at a remote URL. */
export async function uploadImageUrl(url: string, folder = 'stayly'): Promise<string> {
  const result = await cloudinary.uploader.upload(url, { folder, resource_type: 'image' })
  return result.secure_url
}

/** Uploads a list of image sources (buffers or URLs) to Cloudinary. */
export async function uploadImages(
  sources: Array<{ buffer?: Buffer; url?: string }>,
  folder = 'stayly',
): Promise<string[]> {
  if (!isCloudinaryConfigured()) {
    throw Object.assign(new Error('Cloudinary is not configured'), {
      statusCode: 503,
    })
  }
  const urls: string[] = []
  for (const source of sources) {
    if (source.buffer) urls.push(await uploadImageBuffer(source.buffer, folder))
    else if (source.url) urls.push(await uploadImageUrl(source.url, folder))
  }
  return urls
}