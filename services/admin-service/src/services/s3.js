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

function isMinio() {
  return ['1', 'true', 'yes'].includes(String(process.env.MINIO || '').toLowerCase());
}

function getPublicBaseUrl(bucket) {
  const rawBase = process.env.S3_PUBLIC_URL;
  if (!rawBase) return '';

  let base = rawBase.trim().replace(/\/+$/, '');
  const bucketPath = `/${bucket}`;
  const bucketIndex = base.indexOf(`${bucketPath}/`);
  if (bucketIndex !== -1) return base.slice(0, bucketIndex + bucketPath.length);

  const objectIndex = base.indexOf('/prizes/');
  if (objectIndex !== -1) base = base.slice(0, objectIndex);

  if (isMinio() && !base.endsWith(bucketPath)) return `${base}${bucketPath}`;
  return base;
}

function getPublicUrl(bucket, key) {
  const base = getPublicBaseUrl(bucket);
  if (base) {
    return `${base}/${key}`;
  }

  if (process.env.S3_ENDPOINT) {
    const endpoint = process.env.S3_ENDPOINT.trim().replace(/\/+$/, '');
    return `${endpoint}/${bucket}/${key}`;
  }

  const region = process.env.S3_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
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

  return getPublicUrl(bucket, key);
}
