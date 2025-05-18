const Category = require('../models/Category');
const Quiz = require('../models/Quiz');

// Összes kategória lekérdezése
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Kategória lekérdezése ID alapján
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Új kategória létrehozása (admin jogosultsággal)
exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Kategória frissítése (admin jogosultsággal)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category' });
  }
};

// Kategória törlése (admin jogosultsággal)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Ellenőrizni, ha bármely quiz használja ezt a kategóriát
    const quizCount = await Quiz.countDocuments({ category: req.params.id });
    if (quizCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It's being used by ${quizCount} quizzes.`
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category' });
  }
};

// Kategória statisztikák lekérdezése
exports.getCategoryStats = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Kategória lekérdezése
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Quizok száma ebben a kategóriában
    const quizCount = await Quiz.countDocuments({ 
      category: categoryId,
      isPublic: true
    });
    
    // Quiz létrehozók száma ebben a kategóriában
    const creators = await Quiz.find({ 
      category: categoryId,
      isPublic: true 
    })
    .select('createdBy')
    .populate('createdBy', 'username')
    .distinct('createdBy');
    
    // Összes kérdés száma ebben a kategóriában
    const quizzes = await Quiz.find({ 
      category: categoryId,
      isPublic: true 
    });
    
    let totalQuestions = 0;
    quizzes.forEach(quiz => {
      totalQuestions += quiz.questions.length;
    });
    
    res.json({
      category: {
        id: category._id,
        name: category.name,
        description: category.description
      },
      quizCount,
      creatorCount: creators.length,
      totalQuestions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching category statistics' });
  }
}; 