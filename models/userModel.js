const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        mobileNumber: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: false
        },
        profileImage: {
            type: String,
            required: false
        },
        termsAndConditions: {
            type: Boolean,
            default: true
        },
        favorites: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Outfitter' // Reference to the Outfitter model
            }
        ],
        licenseFile: {
            type: String, // Assuming you store the file URL or path
            required: false
        },
        guideId: {
            type: Schema.Types.ObjectId,
            ref: 'Guide' // Reference to the Guide model
        },
        preHuntingTaskDone: {
            type: Boolean,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        bookings: [{
            outfitterId: {
                type: Schema.Types.ObjectId,
                ref: 'Outfitter'
            },
            date: {
                type: Date,
                default: Date.now
            },
            // Additional fields can be added as needed (e.g., booking date, duration)
        }],

        resetToken: String,

        resetTokenExpiration: Date,

        roles: String,

        otp: { type: String },
        otpExpiration: { type: Date },
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('User', UserSchema);