const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { auth, adminAuth } = require('../middleware/auth');

// Összes publikus quiz lekérdezése
router.get('/', quizController.getAllQuizzes);

// Felhasználónév alapú quiz lekérdezése (előtte /:id útvonal)
router.get('/user/quizzes', auth, quizController.getUserQuizzes);

// Véletlenszerű quiz lekérdezése egy kategóriából
router.get('/random/:categoryId', quizController.getRandomQuiz);

// Felhasználónév alapú quiz előzményeinek lekérdezése
router.get('/history', auth, quizController.getUserQuizHistory);

// ID alapú quiz lekérdezése (előtte /:id útvonal)
router.get('/:id', quizController.getQuizById);

// Új quiz létrehozása
router.post('/', auth, quizController.createQuiz);

// Quiz elküldése
router.post('/:id/submit', auth, quizController.submitQuiz);

// Quiz frissítése
router.put('/:id', auth, quizController.updateQuiz);

// Quiz törlése
router.delete('/:id', auth, quizController.deleteQuiz);

module.exports = router; 