const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    _id: {
        type: String,
    },
    username: {
        type: String,
        required: true,
    },
    vendors: {
        type: [String],
    },
    reviews: {
        type: [String],
    },
    vendorsReviewedByMe: {
        type: [String],
    },
    reportsByMe: {
        type: [String],
    },
    vendorsReportedByMe: {
        type: [String],
    },
    level:{
        type: Number,
    },
    points:{
        type: Number,
    },
    nextLevelAt:{
        type: Number,
    },
    editsRemaining:{
        type: Number,
    },
    addsRemaining:{
        type: Number,
    },
    lastVendorAdded:{
        type: Date,
    },
    lastVendorEdited:{
        type: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Users', UserSchema);