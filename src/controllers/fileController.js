const fs = require('fs'); // 使用 fs 來獲取 createReadStream 方法
const archiver = require('archiver');

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

    async unzip(archive, target) {
        const archivePath = this.path.join(this.staticDir, archive);
        const targetPath = this.path.join(this.staticDir, target);

        // 使用 `unzipper` 庫來解壓縮
        const unzipper = require('unzipper');
        try {
            // 檢查目標目錄是否存在
            const targetExists = await this.fs.access(targetPath).then(() => true).catch(() => false);
            if (targetExists) {
                const targetFiles = await this.fs.readdir(targetPath);
                if (targetFiles.length > 0) {
                    console.warn(`Target directory ${targetPath} is not empty.`);
                    return;
                }
            } else {
                await this.fs.mkdir(targetPath, { recursive: true });
            }

            fs.createReadStream(archivePath)
                .pipe(unzipper.Extract({ path: targetPath }))
                .promise()
                .then(async () => {
                    await this.fs.unlink(archivePath); // 移除壓縮檔案
                })
                .catch(err => {
                    console.error(`Error unzipping archive: ${archive}`, err);
                    throw err;
                });
        } catch (err) {
            console.error(`Error unzipping archive: ${archive}`, err);
            throw err;
        }
    }

    async compressAndDelete(folder, archive) {
        const folderPath = this.path.join(this.staticDir, folder);
        const archivePath = this.path.join(this.staticDir, archive);

        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(archivePath);
            const archive = archiver('zip', {
                zlib: { level: 9 }
            });

            output.on('close', async () => {
                try {
                    await this.fs.rmdir(folderPath, { recursive: true });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(folderPath, false);
            archive.finalize();
        });
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
        return fileName.startsWith('@') || fileName.startsWith('#recycle');
    }
}

module.exports = { FileController };