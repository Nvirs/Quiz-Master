// const Leaderboard = require('../models/Leaderboard');
// const Category = require('../models/Category');

// // Get leaderboard for a category
// exports.getCategoryLeaderboard = async (req, res) => {
//   try {
//     const leaderboard = await Leaderboard.find({ category: req.params.categoryId })
//       .populate('user', 'username')
//       .sort({ score: -1, timeTaken: 1 })
//       .limit(10);
    
//     res.json(leaderboard);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching leaderboard' });
//   }
// };

// // Get user's best scores across all categories
// exports.getUserScores = async (req, res) => {
//   try {
//     const scores = await Leaderboard.find({ user: req.user._id })
//       .populate('category', 'name')
//       .sort({ score: -1 });
    
//     res.json(scores);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching user scores' });
//   }
// };

// // Get global leaderboard (top users across all categories)
// exports.getGlobalLeaderboard = async (req, res) => {
//   try {
//     // Aggregate to get total scores per user across all categories
//     const globalLeaderboard = await Leaderboard.aggregate([
//       {
//         $group: {
//           _id: '$user',
//           totalScore: { $sum: '$score' },
//           quizzesTaken: { $sum: 1 },
//           avgScore: { $avg: '$score' },
//           bestScore: { $max: '$score' }
//         }
//       },
//       { $sort: { totalScore: -1 } },
//       { $limit: 20 }
//     ]);
    
//     // Populate user information
//     await Leaderboard.populate(globalLeaderboard, { path: '_id', select: 'username', model: 'User' });
    
//     // Format the result
//     const formattedLeaderboard = globalLeaderboard.map(entry => ({
//       user: entry._id,
//       totalScore: entry.totalScore,
//       quizzesTaken: entry.quizzesTaken,
//       avgScore: parseFloat(entry.avgScore.toFixed(2)),
//       bestScore: entry.bestScore
//     }));
    
//     res.json(formattedLeaderboard);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching global leaderboard' });
//   }
// };

// // Get leaderboard statistics
// exports.getLeaderboardStats = async (req, res) => {
//   try {
//     // Get total number of leaderboard entries
//     const totalEntries = await Leaderboard.countDocuments();
    
//     // Get all categories with at least one entry
//     const categoriesWithEntries = await Leaderboard.distinct('category');
    
//     // Get most active category (most entries)
//     const categoryEntries = await Leaderboard.aggregate([
//       { $group: { _id: '$category', count: { $sum: 1 } } },
//       { $sort: { count: -1 } },
//       { $limit: 1 }
//     ]);
    
//     let mostActiveCategory = null;
//     if (categoryEntries.length > 0) {
//       const category = await Category.findById(categoryEntries[0]._id);
//       mostActiveCategory = {
//         id: category._id,
//         name: category.name,
//         entryCount: categoryEntries[0].count
//       };
//     }
    
//     // Get highest score ever recorded
//     const highestScore = await Leaderboard.findOne().sort({ score: -1 }).limit(1)
//       .populate('user', 'username')
//       .populate('category', 'name');
    
//     res.json({
//       totalEntries,
//       activeCategoryCount: categoriesWithEntries.length,
//       mostActiveCategory,
//       highestScore: highestScore ? {
//         score: highestScore.score,
//         user: highestScore.user.username,
//         category: highestScore.category.name,
//         date: highestScore.completedAt
//       } : null
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error fetching leaderboard statistics' });
//   }
// }; 