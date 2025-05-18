const User = require('../models/User');
const Quiz = require('../models/Quiz');
const jwt = require('jsonwebtoken');

// Új felhasználó regisztrálása
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Ellenőrizni, ha a beviteli adatok hiányosak
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Ellenőrizni, ha a email formátum hibás
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Ellenőrizni, ha a jelszó legalább 6 karakter hosszú
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Ellenőrizni, ha a felhasználó már létezik
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Új felhasználó létrehozása
    const user = new User({ username, email, password });
    await user.save();

    // Token generálása
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
};

// Felhasználó bejelentkezése
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ellenőrizni, ha a beviteli adatok hiányosak
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Felhasználó keresése
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Ellenőrizni, ha a jelszó helyes
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Token generálása
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in. Please try again.' });
  }
};

// Felhasználó profiljának lekérdezése
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Felhasználó profiljának frissítése
exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    
    // Ellenőrizni, ha a beviteli adatok hiányosak
    if (!username && !email) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
    }
    
    // Ellenőrizni, ha a felhasználónév vagy email már foglalt
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email }
      ],
      _id: { $ne: req.user._id }
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    const updates = {};
    if (username) updates.username = username;
    if (email) updates.email = email;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Jelszó módosítása
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Ellenőrizni, ha a beviteli adatok hiányosak
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ellenőrizni, ha a jelszó helyes
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Jelszó frissítése
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
};

// Felhasználó statisztikák lekérdezése
exports.getUserStats = async (req, res) => {
  try {
    // Quizok száma, amelyeket a felhasználó létrehozott
    const quizzesCreated = await Quiz.countDocuments({ createdBy: req.user._id });
    
    // Quizok száma, amelyeket a felhasználó megoldott
    const quizzesTaken = await Quiz.find({ 
      'submissions.user': req.user._id 
    }).countDocuments();
    
    res.json({
      quizzesCreated,
      quizzesTaken
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Error fetching user stats' });
  }
}; 