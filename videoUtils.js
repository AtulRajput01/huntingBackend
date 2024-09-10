const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

function validateFile(filePath) {
  return new Promise((resolve, reject) => {
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        reject(new Error(`File ${filePath} does not exist`));
        return;
      }

      // Use fluent-ffmpeg to fetch video duration
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const durationInSeconds = metadata.format.duration;
        if (durationInSeconds < 1) {
          reject(new Error('Invalid Video! Video duration is less than 1 second'));
        } else {
          resolve(durationInSeconds);
        }
      });
    });
  });
}

// Example usage:
const videoFilePath = 'https://videos.pexels.com/video-files/4106826/4106826-hd_1920_1080_30fps.mp4';

validateFile(videoFilePath)
  .then(duration => {
    console.log(`Video duration: ${duration} seconds`);
    // Call your method to handle valid video
  })
  .catch(error => {
    console.error('Error validating video:', error.message);
    // Handle the error (e.g., log, respond with error message)
  });