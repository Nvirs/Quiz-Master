const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');

// Minden útvonal admin hitelesítésre szükséges
router.use(adminAuth);

// Összes felhasználó lekérdezése
router.get('/users', adminController.getAllUsers);

// Felhasználó szerepkörének frissítése
router.put('/users/:userId/role', adminController.updateUserRole);

// Felhasználó törlése
router.delete('/users/:userId', adminController.deleteUser);

// Irányítópult statisztikák lekérdezése
router.get('/dashboard', adminController.getDashboardStats);

// Címkezett tartalom ellenőrzése és kezelése
router.get('/moderation/flagged', adminController.getFlaggedQuizzes);

// Quiz moderálása
router.put('/moderation/quizzes/:quizId', adminController.moderateQuiz);

module.exports = router; 