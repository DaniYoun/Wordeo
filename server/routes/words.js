const express = require('express');
const router = express.Router();

// load models
const Word = require('../models/words');

// endpoints

// create a single word
router.post("/word", async (req, res) => {
    // the JSON request body: e.g., {"word": "my word", "hints": ["hint1", "hint2"]}
    const word = req.body.word;     // a single word
    const hints = req.body.hints;   // list of hints for the word

    const newWord = new Word({
        word: word,
        hints: hints
    });

    try {
        const result = await newWord.save();
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// read multiple words
// Note: this could return multiple words since a word is not unique
router.get("/word", async (req, res) => {
    // the JSON request body: e.g., {"word": "my word"}
    const word = req.body.word;     // a single word

    try {
        const result = await Word.find({ word: word });
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// update a single word
// Note: you need to provide a hint to identify a word since a word is not unique
// Note: the newHints will override the existing hints, not added
router.patch("/word", async (req, res) => {
    // the JSON request body: e.g., {"word": "my word", "hint": "original hint 1", "newHints": ["new hint1", "new hint2"]}
    const word = req.body.word;             // a single word
    const hint = req.body.hint;             // a single hint to identify the word
    const newHints = req.body.newHints;     // a list of new hints for the word to be updated

    try {
        const result = await Word.updateOne({ word: word, hints: hint }, { hints: newHints });
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// delete a single word
// Note: you would need to provide a hint to identify a word since a word is not unique
router.delete("/word", async (req, res) => {
    // the JSON request body: e.g., {"word": "my word", "hint": "original hint 1"}
    const word = req.body.word;     // a single word
    const hint = req.body.hint;     // a single hint to identify the word

    try {
        const result = await Word.deleteOne({ word: word, hints: hint });
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

// create multiple words
router.post("/", async (req, res) => {
    // the JSON request body: e.g., {"words": [{"word": "my word", "hints": ["hint1", "hint2"]}]}
    const words = req.body.words;   // list of word & hints pair

    try {
        const result = await Word.insertMany(words);
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    } 
});

// get all words
router.get("/", async (req, res) => {
    try {
        const result = await Word.find();
        res.status(200).json(result);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
})

// export
module.exports = router;