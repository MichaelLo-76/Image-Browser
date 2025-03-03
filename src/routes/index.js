const express = require('express');
const { FileController } = require('../controllers/fileController');
const { ArchiveHandler } = require('../controllers/archiveHandler');

const router = express.Router();
const fileController = new FileController();
const archiveHandler = new ArchiveHandler();

router.get('/folders', (req, res) => {
    const directory = req.query.directory || ''; // 從查詢參數中獲取目錄路徑，默認為根目錄
    fileController.getFoldersAndArchives(directory)
    .then(({ folders, archives }) => res.json({ folders, archives }))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.get('/images', (req, res) => {
    const directory = req.query.directory || ''; // 從查詢參數中獲取目錄路徑，默認為根目錄
    const regenThumbnail = req.query.regenThumbnail === 'true'; // 從查詢參數中獲取目錄路徑，默認為根目錄
    fileController.getImages(directory, regenThumbnail)
        .then(images => res.json(images))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/unzip', (req, res) => {
    const archive = req.query.archive; // 從查詢參數中獲取檔案路徑
    const target = req.query.target; // 從查詢參數中獲取目錄路徑
    archiveHandler.unzip(archive, target)
        .then(result => res.json({ message: 'File unzipped successfully', result }))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/compress', (req, res) => {
    const folder = req.query.folder;
    const archive = req.query.archive;
    archiveHandler.compressAndDelete(folder, archive)
        .then(() => res.json({ message: 'Folder compressed and deleted successfully' }))
        .catch(err => res.status(500).json({ error: err.message }));
});

router.post('/rename', async (req, res) => {
    const oldPath = req.query.oldPath;
    const newPath = req.query.newPath;
    try {
        await fileController.renameFolder(oldPath, newPath);
        res.json({ message: 'Folder renamed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/config', async (req, res) => {
    const directory = req.query.directory;
    try {
        const configData = await fileController.readConfig(directory);
        res.json({ message: 'Config read successfully', data: configData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/config/update', async (req, res) => {
    const directory = req.query.directory;
    const newConfig = req.body;
    try {
        await fileController.updateConfig(directory, newConfig);
        res.json({ message: 'Config updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;