const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    vendorId: {
        type: String,
        required: true,
    },
    stars: {
        type: Number,
        required: true
    },
    by: {
        type: mongoose.Schema.Types.String,
        ref: 'Users'
    },
    review: {
        type: String,
        required: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);