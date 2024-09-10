require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Import routes
const roleRoute = require('./routes/roleRoute');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const animalRoute = require('./routes/animalRoute');
const outfitterRoute = require('./routes/outfitterRoute');
const quizRoute = require('./routes/quizRoute');
const slotRoute = require('./routes/slotRoute');
const guideRoute = require('./routes/guideRoute');
const bookingRoute = require('./routes/bookingRoute');
const animal=require('./routes/animalRoute')
// Environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;
const FRONTEND = process.env.FRONTEND;

const app = express();

const corsOptions = {
    origin: '*', // Allow requests from 13.200.240.28:3001
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  };
  
  app.use(cors(corsOptions));

// Use cors middleware with options
// app.use(cors({
//     origin: 'http://13.200.240.28:3001', // Allow requests from frontend origin
//     credentials: true // Allow credentials (cookies, authorization headers, etc.)
//   }));

// Middleware
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/role', roleRoute);
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/animals', animalRoute);  // Added animal routes
app.use('/api/outfitter', outfitterRoute); //Added outfitter routes
app.use('/api/quiz', quizRoute); //Added quiz routes
app.use('/api/slot', slotRoute); //Added slot routes
app.use('/api/guide', guideRoute); //Added slot routes
app.use('/api/booking', bookingRoute); //Added slot routes
app.use('/api',animal)
// Response handler middleware
app.use((obj, req, res, next) => {
    const statusCode = obj.status || 500;
    const message = obj.message || "Something went wrong!";
    return res.status(statusCode).json({
        success: [200, 201, 204].includes(obj.status),
        status: statusCode,
        message: message,
        data: obj.data
    });
});

// Database connection
mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
    });

module.exports = app;
