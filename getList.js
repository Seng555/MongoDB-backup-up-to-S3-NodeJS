import { ListObjectsV2Command , DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3, bucketName } from './upload_s3.js';

const getList = async () => {
  try {
    const input = {
      Bucket: bucketName,
      Prefix: "backups/",
     // MaxKeys: 10
    };
    const command = new ListObjectsV2Command(input);
    const response = await s3.send(command);
    console.log("All list", response.Contents.length);
    response.Contents.forEach(async (item) => {
        if (checkIfMoreThan10DaysAgo(item.LastModified)) {
          deleteObjectFromS3(bucketName, item.Key); // Replace YOUR_BUCKET_NAME with your S3 bucket name
        }
      });
  } catch (error) {
    console.log('Get list err', error);
  }
}

// Function to delete an object from S3
const deleteObjectFromS3 = async (bucketName, objectKey) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: objectKey,
    };

    const command = new DeleteObjectCommand(params);
    const response = await s3.send(command);

    console.log("Object deleted successfully:", response);
  } catch (error) {
    console.error("Error deleting object:", error);
  }
};

const checkIfMoreThan10DaysAgo = (lastModifiedDateString) => {
  const lastModified = new Date(lastModifiedDateString);
  const currentDate = new Date();

  // Calculate the difference in milliseconds between the current date and LastModified date
  const differenceInMs = currentDate - lastModified;

  // Calculate the number of days from milliseconds
  const daysDifference = differenceInMs / (1000 * 60 * 60 * 24);

  return daysDifference > 10;
};


export { getList};