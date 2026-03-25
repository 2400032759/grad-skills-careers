'use server';

import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import r2 from '@/lib/r2';

/**
 * Generates a pre-signed URL for direct upload to Cloudflare R2 from the browser.
 */
export async function getR2PresignedUrl(fileName: string, contentType: string) {
  try {
    const key = `resumes/${Date.now()}-${fileName}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(r2, command, { expiresIn: 60 * 5 }); // 5 minutes

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return { success: true, signedUrl, publicUrl, key };
  } catch (error: any) {
    console.error('R2 Signed URL error:', error);
    return { success: false, error: error.message };
  }
}
