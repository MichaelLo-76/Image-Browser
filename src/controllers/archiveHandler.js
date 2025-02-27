const fs = require('fs'); // 使用 fs 來獲取 createReadStream 方法
const archiver = require('archiver');
const unzipper = require('unzipper');

class ArchiveHandler {
    constructor() {
        this.fs = require('fs').promises; // 使用 fs.promises 來處理異步操作
        this.path = require('path');
        this.staticDir = this.path.join(__dirname, '../../public'); // 設置靜態文件的絕對路徑
    }

    async unzip(archive, target) {
        const archivePath = this.path.join(this.staticDir, archive);
        const targetPath = this.path.join(this.staticDir, target);

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
}

module.exports = { ArchiveHandler };