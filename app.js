import { MongoClient } from 'mongodb';
import { spawn } from 'child_process';
import cron from 'node-cron';
import archiver from 'archiver';
import { createWriteStream, rmSync } from 'fs';
import { uploadBackupToS3 } from './upload_s3.js';
import { getList } from './getList.js';
import {connectToMongoDB, Disconnected} from './cnn.js';

const uri = 'mongodb://paymart_u:Wo0R0ZKnHyeVfTYrGVO8bCupV@paydb.paymartpayrich.com:27017,paydb.paymartpayrich.com:27018,paydb.paymartpayrich.com:27019/paymart?replicaSet=paymart&retryWrites=true&w=majority&authSource=admin'; // Replace with your MongoDB URI
const backupDir = 'dump'; // Replace with your desired backup directory

// Create a custom wrapper for spawn with promises
const spawnPromise = (command, args, options) => {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, options);
    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" failed with code ${code}`));
      }
    });
  });
};

async function backupDatabase() {
 // let client;
  try {
    await connectToMongoDB(uri);
    const currentDate = new Date().toLocaleString().replace(/[/:, ]/g, '-');
    console.log('backUp started', currentDate);
    const backupCommand = 'mongodump';
    const backupArgs = [`--uri=${uri}`, `--out=${backupDir}`];
    console.log(backupCommand, ...backupArgs);

    await spawnPromise(backupCommand, backupArgs);
    console.log('Backup completed successfully');

    const zipFilePath = `${currentDate}.zip`;
    const output = createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', async function () {
      console.log('Backup folder has been zipped successfully');
      // Delete the backup folder (if needed)
       rmSync(backupDir, { recursive: true });

      // Upload to S3 (if needed)
      console.log(`Start upload to S3 ${currentDate}`);
       await  uploadBackupToS3(zipFilePath, currentDate);
      console.log(`Upload done`);
      console.log('Backup folder has been deleted', zipFilePath);
      await getList();
    });

    archive.on('error', function (err) {
      throw err;
    });

    archive.pipe(output);
    archive.directory(backupDir, true);
    archive.finalize();
  } catch (err) {
    console.error('Error during backup', err);
  } finally {
    //if (client) {
      await Disconnected()
    //}
  }
}

//backupDatabase();

let client =null;
async function run(){
  try {
    //backupDatabase();
    cron.schedule('0 */12 * * *', backupDatabase);
  } catch (error) {
    console.log(error)
  }
  
}

run()
