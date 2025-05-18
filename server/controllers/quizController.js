const Quiz = require('../models/Quiz');
const Leaderboard = require('../models/Leaderboard');

// Összes publikus quiz lekérdezése
exports.getAllQuizzes = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isPublic: true };
    
    // Kategória szűrő hozzáadása, ha meg van adva
    if (category) {
      query.category = category;
    }

    const quizzes = await Quiz.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
};

// ID alapú quiz lekérdezése
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'username');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Csak akkor, ha kéri a felhasználó
    if (!req.query.includeAnswers) {
      quiz.questions.forEach(q => {
        q.correctAnswer = undefined;
      });
    }
    
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
};

// Új quiz létrehozása
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, category, questions, emoji } = req.body;
    
    // Kötelező mezők ellenőrzése
    if (!title || !description || !category || !questions || !questions.length) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Kérdések ellenőrzése
    for (const question of questions) {
      if (!question.question || !question.options || question.options.length < 2 || 
          question.correctAnswer === undefined || question.correctAnswer === null) {
        return res.status(400).json({ message: 'Invalid question format' });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      category,
      questions,
      emoji,
      createdBy: req.user._id
    });

    await quiz.save();
    await quiz.populate('category', 'name');
    await quiz.populate('createdBy', 'username');

    res.status(201).json({ 
      message: 'Quiz created successfully',
      quiz 
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
};

// Felhasználónév alapú quiz lekérdezése
exports.getUserQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user._id })
            .populate('category', 'name')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        
        res.json(quizzes);
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ message: 'Error fetching your quizzes' });
    }
};

// Quiz frissítése
exports.updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Ellenőrizni, ha a felhasználó a létrehozó
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this quiz' });
        }
        
        const { title, description, category, questions, emoji, isPublic } = req.body;

        // Kötelező mezők ellenőrzése
        if (!title || !description || !category || !questions || !questions.length) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Kérdések ellenőrzése
        for (const question of questions) {
            if (!question.question || !question.options || question.options.length < 2 || 
                question.correctAnswer === undefined || question.correctAnswer === null) {
                return res.status(400).json({ message: 'Invalid question format' });
            }
        }

        quiz.title = title;
        quiz.description = description;
        quiz.category = category;
        quiz.questions = questions;
        quiz.emoji = emoji;
        quiz.isPublic = isPublic;

        await quiz.save();
        await quiz.populate('category', 'name');
        await quiz.populate('createdBy', 'username');

        res.json(quiz);
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ message: 'Error updating quiz' });
    }
};

// Quiz törlése
exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        // Ellenőrizni, ha a felhasználó a létrehozó
        if (quiz.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }
        
        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({ message: 'Error deleting quiz' });
    }
};

// Quiz elküldése
exports.submitQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        
        const { answers } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid answers format' });
        }

        let score = 0;
        const results = [];
        
        // Pontszám kiszámítása és részletes eredmények előkészítése
        quiz.questions.forEach((question, index) => {
            const userAnswer = answers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                score += question.points || 1;
            }
            
            results.push({
                questionId: index,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect,
                points: isCorrect ? (question.points || 1) : 0
            });
        });
        
        res.json({ 
            score,
            totalPoints: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
            results
        });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Error submitting quiz' });
    }
};

// Véletlenszerű quiz lekérdezése egy kategóriából
exports.getRandomQuiz = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { limit = 10 } = req.query;
    
    // Keresni minden kategóriában
    const quizzes = await Quiz.find({ 
      category: categoryId,
      isPublic: true
    }).select('_id');
    
    if (quizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found in this category' });
    }
    
    // Véletlenszerű quiz ID lekérdezése
    const randomQuizId = quizzes[Math.floor(Math.random() * quizzes.length)]._id;
    
    // Véletlenszerű quiz teljes lekérdezése
    const quiz = await Quiz.findById(randomQuizId)
      .populate('category', 'name')
      .populate('createdBy', 'username')
      .select('-questions.correctAnswer');
    
    // Ha a limit paraméter meg van adva, csak annyi kérdést ad vissza
    if (quiz.questions.length > limit) {
      const shuffledQuestions = [...quiz.questions].sort(() => 0.5 - Math.random());
      quiz.questions = shuffledQuestions.slice(0, parseInt(limit));
    }
    
    res.json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching random quiz' });
  }
};

// Felhasználónév alapú quiz előzményeinek lekérdezése
exports.getUserQuizHistory = async (req, res) => {
  try {
    const history = await Leaderboard.find({ user: req.user._id })
      .populate('category', 'name')
      .sort({ completedAt: -1 })
      .limit(20);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz history' });
  }
}; 
