// const mongoose = require('mongoose');

// const leaderboardSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category',
//     required: true
//   },
//   score: {
//     type: Number,
//     required: true
//   },
//   timeTaken: {
//     type: Number, // Eltelt idő másodpercben
//     required: true
//   },
//   completedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Összetett index azzal, hogy egy felhasználó egy kategóriában csak egy bejegyzés legyen
// leaderboardSchema.index({ user: 1, category: 1 }, { unique: true });

// module.exports = mongoose.model('Leaderboard', leaderboardSchema); 