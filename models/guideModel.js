const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const GuideSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: false
        },
        mobileNumber: {
            type: Number,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        password: {
            type: String,
            required: false
        },       
        profileImage: {
            type: String,
            required: false
        },
        userInfo: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        trackers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tracker' }],

        resetToken: String,

        resetTokenExpiration: Date,

        roles: {
            type: String,
            required: false,
            ref: "guide"
        },
        otp: { type: String },
        otpExpiration: { type: Date },
    },
    {
        timestamps: true
    }
);
 
module.exports = mongoose.model('Guide', GuideSchema);