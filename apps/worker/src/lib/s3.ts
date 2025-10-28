import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@bloom/config";

export const s3 = new S3Client({
  region: config.doSpacesRegion,
  endpoint: config.doSpacesEndpoint,
  credentials: {
    accessKeyId: config.doSpacesKey,
    secretAccessKey: config.doSpacesSecret,
  },
  forcePathStyle: true,
});

export function getSignedUrlCommand(expiresIn: number, projectId: string) {
  const getObjectCommand = new GetObjectCommand({
    Bucket: config.doSpacesBucket,
    Key: `snapshots/${projectId}.tar.gz`,
  });
  return getSignedUrl(s3, getObjectCommand, { expiresIn });
}
