const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Category = require('../models/Category');
const Leaderboard = require('../models/Leaderboard');

// Összes felhasználó lekérdezése
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Felhasználó szerepkörének frissítése
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role' });
  }
};

// Felhasználó törlése
exports.deleteUser = async (req, res) => {
  try {
    // Nem engedélyezni, hogy admin törölje önmagát
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Felhasználónév alapú quiz törlése
    await Quiz.deleteMany({ createdBy: req.params.userId });
    
    // Felhasználónév alapú leaderboard bejegyzések törlése
    await Leaderboard.deleteMany({ user: req.params.userId });
    
    // Felhasználó törlése
    await User.findByIdAndDelete(req.params.userId);
    
    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Irányítópult statisztikák lekérdezése
exports.getDashboardStats = async (req, res) => {
  try {
    // Összes felhasználó száma
    const totalUsers = await User.countDocuments();
    
    // Adminok száma
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Összes quiz száma
    const totalQuizzes = await Quiz.countDocuments();
    
    // Publikus quizok száma
    const publicQuizzes = await Quiz.countDocuments({ isPublic: true });
    
    // Összes kategória száma
    const totalCategories = await Category.countDocuments();
    
    // Összes leaderboard bejegyzés száma
    const totalLeaderboardEntries = await Leaderboard.countDocuments();
    
    // Utoljára létrehozott felhasználók
    const recentUsers = await User.find()
      .select('username email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Utoljára létrehozott quizok
    const recentQuizzes = await Quiz.find()
      .select('title category createdBy createdAt')
      .populate('category', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      counts: {
        users: totalUsers,
        admins: adminCount,
        quizzes: totalQuizzes,
        publicQuizzes,
        categories: totalCategories,
        leaderboardEntries: totalLeaderboardEntries
      },
      recent: {
        users: recentUsers,
        quizzes: recentQuizzes
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

// Címkezett tartalom ellenőrzése és kezelése
exports.getFlaggedQuizzes = async (req, res) => {
  try {
    // Ez általában egy flag mezőt jelentene a Quiz modelben
    // Jelenleg csak egy placeholdert adunk vissza
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching flagged content' });
  }
};

// Quiz jóváhagyása/elutasítása (moderálás céljából)
exports.moderateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { approved } = req.body;
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    if (approved) {
      // Jóváhagyás - beállítja publikusra
      quiz.isPublic = true;
    } else {
      // Elutasítás - törölni vagy hozzáadni egy elutasítási okot
      quiz.isPublic = false;
    }
    
    await quiz.save();
    
    res.json({
      message: approved ? 'Quiz approved' : 'Quiz rejected',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        isPublic: quiz.isPublic
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error moderating quiz' });
  }
}; 