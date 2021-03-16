const mongoose = require('mongoose');

// const PointSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ['Point'],
//     //required: true
//   },
//   coordinates: {
//     type: [Number],
//     required: true
//   }
// });

const VendorSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: "text"
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      index: "2d"
    },
  },
  tags: {
    type: [String],
    required: true,
    index: "text"
  },
  images: {
    type: [String],
    required: false
  },
  description: {
    type: String,
    required: true,
  },
  reviews: {
    type: [String],
    required: false,
  },
  reviewers: {
    type: [String],
    required: false,
  },
  totalStars: {
    type: Number,
    required: true,
  },
  totalReviews: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  reports: {
    type: [String],
    required: false,
  },
  reporters: {
    type: [String],
    required: false,
  },
  totalReports: {
    type: Number,
    required: true,
  },
  postedBy: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
}, { timestamps: true });
VendorSchema.index({ name: 'text', tags: 'text' });

// const VendorSchema = mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     lat: {
//         type: String,
//         required: true
//     },
//     lng: {
//         type: String,
//         required: true
//     },
//     tags: {
//         type: String,
//         required: true
//     }
// })

module.exports = mongoose.model('Vendors', VendorSchema);
//module.exports = mongoose.model('Points', PointSchema);