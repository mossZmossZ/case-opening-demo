import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

let client = null;

function getClient() {
  if (client) return client;
  client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    ...(process.env.S3_ENDPOINT && {
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
    }),
  });
  return client;
}

export async function uploadToS3(buffer, filename, mimetype) {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error('S3_BUCKET is not configured');

  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `prizes/${Date.now()}-${safeFilename}`;

  await getClient().send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  if (process.env.S3_ENDPOINT) {
    const base = process.env.S3_ENDPOINT.replace(/\/$/, '');
    return `${base}/${bucket}/${key}`;
  }
  const region = process.env.S3_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
