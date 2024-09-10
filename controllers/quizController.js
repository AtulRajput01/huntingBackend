const Quiz = require('../models/quizModel');
const User = require('../models/userModel');
// const { getVideoDuration } = require('../videoUtils'); // Path to your videoUtils.js
const createError = require('../middleware/error');
const createSuccess = require('../middleware/success');
// const fs = require('fs');
// const ffmpeg = require('fluent-ffmpeg');

// Create new quiz question
const createQuizQuestion = async (req, res, next) => {
  try {
      const { question, options, correctAnswer, tutorialVideo, watchedVideo } = req.body;

      // Validate required fields
      if (!question || !options || !correctAnswer || !tutorialVideo) {
          return res.status(400).json({ message: "All fields are required" });
      }

      // Create a new quiz question
      const newQuizQuestion = new Quiz({
          question,
          options,
          correctAnswer,
          tutorialVideo,
          watchedVideo: watchedVideo || false  // Default to false if watchedVideo is not provided
      });

      // Save the new quiz question to the database
      await newQuizQuestion.save();

      // Return success response
      return res.status(201).json({
          message: "Quiz question created successfully",
          quizQuestion: newQuizQuestion
      });
  } catch (error) {
      // Handle internal server error
      return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all quiz questions
const getAllQuizQuestions = async (req, res, next) => {
  try {
    const quizQuestions = await Quiz.find();
    return next(createSuccess(200, "All Quiz Questions", quizQuestions));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// Get a single quiz question by ID
const getQuizQuestionById = async (req, res, next) => {
  try {
    const quizQuestion = await Quiz.findById(req.params.id);
    if (!quizQuestion) {
      return next(createError(404, "Quiz question not found"));
    }
    return next(createSuccess(200, "Quiz Question Found", quizQuestion));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// Update quiz question by ID
const updateQuizQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedQuizQuestion = await Quiz.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedQuizQuestion) {
      return next(createError(404, "Quiz question not found"));
    }
    return next(createSuccess(200, "Quiz Question Updated", updatedQuizQuestion));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// Delete quiz question by ID
const deleteQuizQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedQuizQuestion = await Quiz.findByIdAndDelete(id);
    if (!deletedQuizQuestion) {
      return next(createError(404, "Quiz question not found"));
    }
    return next(createSuccess(200, "Quiz Question Deleted", deletedQuizQuestion));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};


// getting video metadata
// const videoLength = async (req, res) => {
//   const { videoUrl } = req.body;

//   try {
//     const durationInSeconds = await getVideoDuration(videoUrl);
//     res.json({ success: true, durationInSeconds });
//   } catch (error) {
//     console.error('Error fetching video duration:', error);
//     res.status(500).json({ success: false, error: 'Error fetching video duration' });
//   }
// }

// Function to validate and get video duration
// const videoLength = (filePath) => {
//   return new Promise((resolve, reject) => {
//     // Check if file exists
//     fs.access(filePath, fs.constants.F_OK, (err) => {
//       if (err) {
//         reject(new Error(`File ${filePath} does not exist`));
//         return;
//       }

//       // Use fluent-ffmpeg to fetch video duration
//       ffmpeg.ffprobe(filePath, (err, metadata) => {
//         if (err) {
//           reject(err);
//           return;
//         }

//         const durationInSeconds = metadata.format.duration;
//         if (durationInSeconds < 1) {
//           reject(new Error('Invalid Video! Video duration is less than 1 second'));
//         } else {
//           resolve(durationInSeconds);
//         }
//       });
//     });
//   });
// };

// Mark tutorial video as watched
const markVideoAsWatched = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quizQuestion = await Quiz.findById(id);
    if (!quizQuestion) {
      return next(createError(404, "Quiz question not found"));
    }

    quizQuestion.watchedVideo = true;
    await quizQuestion.save();

    return next(createSuccess(200, "Video marked as watched", quizQuestion));
  } catch (error) {
    return next(createError(500, "Internal Server Error"));
  }
};

// Function to check the user's answer
const checkAnswer = async (req, res) => {
  try {
    const { quizId, selectedAnswer, userId } = req.body;

    // Find the quiz by ID
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare selected answer with correct answer
    const isCorrect = selectedAnswer === quiz.correctAnswer;

    // Check if the video is watched and the answer is correct
    if (isCorrect && quiz.watchedVideo) {
      user.preHuntingTaskDone = true;
      await user.save();
    }

    res.status(200).json({
      isCorrect,
      preHuntingTaskDone: user.preHuntingTaskDone,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = {
  createQuizQuestion,
  getAllQuizQuestions,
  getQuizQuestionById,
  updateQuizQuestion,
  deleteQuizQuestion,
  markVideoAsWatched,
  checkAnswer
};
