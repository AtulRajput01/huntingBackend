const express = require('express');
const {
  createQuizQuestion,
  getAllQuizQuestions,
  getQuizQuestionById,
  updateQuizQuestion,
  deleteQuizQuestion,
  markVideoAsWatched,
  checkAnswer
} = require('../controllers/quizController');

const router = express.Router();

// CRUD routes
router.post('/create', createQuizQuestion);
router.get('/getAll', getAllQuizQuestions);
// router.post('/getVideoDuration', videoLength);
router.get('getQuiz/:id', getQuizQuestionById);
router.put('updateQuiz/:id', updateQuizQuestion);
router.delete('deleteQuiz/:id', deleteQuizQuestion);
router.put('quizVideo/:id/watched', markVideoAsWatched);

// Route to check user's answers
router.post('/check-answers', checkAnswer);

module.exports = router;
