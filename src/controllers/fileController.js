class FileController {
    constructor() {
        this.fs = require('fs').promises; // 使用 fs.promises 來處理異步操作
        this.path = require('path');
        this.staticDir = this.path.join(__dirname, '../../public'); // 設置靜態文件的絕對路徑
    }

    async getFolders(directory) {
        try {
            const dirPath = this.path.join(this.staticDir, directory);
            const files = await this.fs.readdir(dirPath, { withFileTypes: true });
            const folders = [];

            for (const file of files) {
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
                }
            }

            return folders;
        } catch (err) {
            throw new Error(`Error reading directory: ${err.message}`);
        }
    }

    async getImages(directory) {
        try {
            const dirPath = this.path.join(this.staticDir, directory);
            const files = await this.fs.readdir(dirPath, { withFileTypes: true });
            const images = [];

            for (const file of files) {
                if (file.isFile() && this.isImage(file.name)) {
                    images.push({
                        name: file.name,
                        thumbnail: this.path.join('/', directory, file.name), // 使用相對於靜態文件服務器的路徑
                        path: this.path.join('/', directory, file.name) // 使用相對於靜態文件服務器的路徑
                    });
                }
            }

            return images;
        } catch (err) {
            throw new Error(`Error reading directory: ${err.message}`);
        }
    }

    isImage(fileName) {
        const ext = this.path.extname(fileName).toLowerCase();
        // return true;
        return ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext);
    }
}

module.exports = { FileController };