const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

// Összes kategória lekérdezése
router.get('/', categoryController.getAllCategories);

// ID alapú kategória lekérdezése
router.get('/:id', categoryController.getCategoryById);

// Kategória statisztikák lekérdezése
router.get('/:id/stats', categoryController.getCategoryStats);

// Új kategória létrehozása (admin jogosultsággal)
router.post('/', adminAuth, categoryController.createCategory);

// Kategória frissítése (admin jogosultsággal)
router.put('/:id', adminAuth, categoryController.updateCategory);

// Kategória törlése (admin jogosultsággal)
router.delete('/:id', adminAuth, categoryController.deleteCategory);

module.exports = router; 