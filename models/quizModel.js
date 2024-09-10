const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500,
    },
    options: {
      type: [String],
      required: true,
      validate: [arrayLimit, '{PATH} exceeds the limit of 4 options'],
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: false,
    },
    tutorialVideo: {
      type: String,
      required: true,
    },
    watchedVideo: {
      type: Boolean,
      default: true,  //till the time video duration is not extracted from the link
    },

  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length === 4;
}

module.exports = mongoose.model('Quiz', quizSchema);
