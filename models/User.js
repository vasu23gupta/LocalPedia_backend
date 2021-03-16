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
}, { timestamps: true });

module.exports = mongoose.model('Users', UserSchema);