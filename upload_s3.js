import { S3Client, AbortMultipartUploadCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { readFileSync, unlinkSync } from 'fs';
import 'dotenv/config';

const s3 = new S3Client({
  region: process.env.region,
  credentials: {
    accessKeyId: process.env.s3accessKeyId,
    secretAccessKey: process.env.s3secretAccessKey,
  },
});
const bucketName = process.env.s3bucketName; // Replace with your S3 bucket name

async function uploadBackupToS3(zipFilePath, currentDate) {
  try {
    const zipFileData = readFileSync(zipFilePath);
    // Setting up S3 upload parameters
    const params = {
      Bucket: bucketName,
      Key: `backups/${currentDate}.zip`, // Replace with your desired S3 key/path
      Body: zipFileData,
    };
    const command = new PutObjectCommand(params);
    const send = await s3.send(command);

    // Delete the ZIP file after upload to S3
    unlinkSync(zipFilePath);

    console.log('Backup ZIP file uploaded to S3:', command);
  } catch (err) {
    console.error('Error uploading ZIP file to S3:', err);
  }
}

// After the ZIP file is created and backup folder is deleted
//const backupPath = 'C:\\src\\backup\\currentDate'; // Replace with the actual path to your backup folder
export { uploadBackupToS3, s3, bucketName};


