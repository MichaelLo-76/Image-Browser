const express = require('express');
const { FileController } = require('../controllers/fileController');

const router = express.Router();
const fileController = new FileController();

router.get('/folders', (req, res) => {
    const directory = req.query.directory || ''; // 從查詢參數中獲取目錄路徑，默認為根目錄
    fileController.getFolders(directory)
        .then(folders => res.json(folders))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/images', (req, res) => {
    const directory = req.query.directory || ''; // 從查詢參數中獲取目錄路徑，默認為根目錄
    fileController.getImages(directory)
        .then(images => res.json(images))
        .catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;