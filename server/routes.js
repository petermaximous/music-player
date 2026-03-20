const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Get all songs
router.get("/songs", (req, res) => {
    const musicPath = req.app.locals.musicPath;
    
    if (!musicPath) {
        return res.status(400).json({ error: "No music folder set" });
    }

    const files = fs.readdirSync(musicPath)
        .filter(file => /\.(mp3|flac|wav|ogg|m4a)$/i.test(file))
        .map((file, index) => ({
            id: index,
            name: file.replace(/\.[^/.]+$/, ""),
            file: file,
        }));

    res.json(files);
});

// Stream a song
router.get("/song/:id", (req, res) => {
    const musicPath = req.app.locals.musicPath;
    const files = fs.readdirSync(musicPath)
        .filter(file => /\.(mp3|flac|wav|ogg|m4a)$/i.test(file));
    
    const file = files[req.params.id];
    if (!file) return res.status(404).json({ error: "Song not found" });

    const filePath = path.join(musicPath, file);
    res.sendFile(filePath);
});

module.exports = router;