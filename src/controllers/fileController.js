const fs = require('fs'); // 使用 fs 來獲取 createReadStream 方法

const { ImageHandler } = require('./imageHandler');
const imageHandler = new ImageHandler();

class FileController {
    constructor() {
        this.fs = require('fs').promises; // 使用 fs.promises 來處理異步操作
        this.path = require('path');
        this.staticDir = this.path.join(__dirname, '../../public'); // 設置靜態文件的絕對路徑
    }

    async getFoldersAndArchives(directory) {
        try {
            const dirPath = this.path.join(this.staticDir, directory);
            const files = await this.fs.readdir(dirPath, { withFileTypes: true });
            const folders = [];
            const archives = [];

            for (const file of files) {
                if (this.isIgnore(file.name)) {
                    continue; // 忽略一些系統文件
                }

                if (file.isDirectory()) {
                    folders.push(file.name);
                } else if (file.isSymbolicLink()) {
                    try {
                        const linkPath = await this.fs.readlink(this.path.join(dirPath, file.name));
                        const stats = await this.fs.stat(linkPath);
                        if (stats.isDirectory()) {
                            folders.push(file.name);
                        }
                    } catch (err) {
                        console.error(`Error resolving symbolic link: ${file.name}`, err);
                    }
                } else if (file.isFile() && this.isArchive(file.name)) {
                    archives.push(file.name);
                }
            }

            return { folders, archives };
        } catch (err) {
            throw new Error(`Error reading directory: ${err.message}`);
        }
    }

    async getImages(directory, regenThumbnail) {
        try {
            const dirPath = this.path.join(this.staticDir, directory);
            const files = await this.fs.readdir(dirPath, { withFileTypes: true });
            const images = [];

            const thumbnailFolderPath = this.path.join(dirPath, 'thumbnails');
            const thumbnailExists = await this.fs.access(thumbnailFolderPath).then(() => true).catch(() => false);
            if (regenThumbnail && thumbnailExists) {
                console.log(`Remove archive: ${thumbnailFolderPath}`);
                fs.rmdir(thumbnailFolderPath, { recursive: true });
            }

            for (const file of files) {
                if (file.isFile() && this.isImage(file.name)) {
                    const imagePath = this.path.join(dirPath, file.name);
                    const thumbnailPath = this.path.join(dirPath, 'thumbnails', file.name);

                    // 檢查縮略圖是否存在，如果不存在則生成縮略圖
                    const thumbnailExists = await this.fs.access(thumbnailPath).then(() => true).catch(() => false);
                    if (!thumbnailExists) {
                        await imageHandler.generateThumbnail(imagePath, thumbnailPath);
                    }

                    images.push({
                        name: file.name,
                        thumbnail: this.path.join('/', directory, 'thumbnails', file.name), // 使用相對於靜態文件服務器的路徑
                        path: this.path.join('/', directory, file.name) // 使用相對於靜態文件服務器的路徑
                    });
                }
            }

            return images;
        } catch (err) {
            throw new Error(`Error reading directory: ${err.message}`);
        }
    }

    async renameFolder(oldDir, newDir) {
        const oldPath = this.path.join(this.staticDir, oldDir);
        const newPath = this.path.join(this.staticDir, newDir);

        try {
            console.log(`Rename archive: ${oldPath} to target: ${newPath}`);
            await this.fs.rename(oldPath, newPath);
        } catch (err) {
            console.error(`Error renaming folder: ${oldPath}`, err);
            throw err;
        }
    }

    isArchive(fileName) {
        const ext = this.path.extname(fileName).toLowerCase();
        return ['.zip', '.rar', '.tar', '.gz', '.7z'].includes(ext);
    }

    isImage(fileName) {
        const ext = this.path.extname(fileName).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext);
    }

    isIgnore(fileName) {
        return fileName.startsWith('@') || fileName.startsWith('#recycle') || fileName.startsWith('thumbnails');
    }

    async readConfig(directory) {
        const configPath = this.path.join(this.staticDir, directory, 'config.json');
        try {
            const configContent = await this.fs.readFile(configPath, 'utf-8');
            return JSON.parse(configContent);
        } catch (err) {
            if (err.code === 'ENOENT') {
                // 如果配置文件不存在，返回默認配置
                return { index: 0 };
            } else {
                throw new Error(`Error reading config file: ${err.message}`);
            }
        }
    }

    async updateConfig(directory, config) {
        const configPath = this.path.join(this.staticDir, directory, 'config.json');
        try {
            await this.fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
        } catch (err) {
            throw new Error(`Error updating config file: ${err.message}`);
        }
    }
}

module.exports = { FileController };