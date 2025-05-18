const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Új felhasználó regisztrálása
router.post('/register', userController.register);

// Felhasználó bejelentkezése
router.post('/login', userController.login);

// Felhasználó profiljának lekérdezése
router.get('/profile', auth, userController.getProfile);

// Felhasználó profiljának frissítése
router.put('/profile', auth, userController.updateProfile);

// Jelszó módosítása
router.post('/change-password', auth, userController.changePassword);

// Felhasználó statisztikák lekérdezése
router.get('/stats', auth, userController.getUserStats);

module.exports = router; 