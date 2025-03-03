const fs = require('fs'); // 使用 fs 來獲取 createReadStream 方法
const sharp = require('sharp');

class ImageHandler {
    constructor() {
        this.fs = require('fs').promises; // 使用 fs.promises 來處理異步操作
        this.path = require('path');
        this.staticDir = this.path.join(__dirname, '../../public'); // 設置靜態文件的絕對路徑
    }

    async generateThumbnail(imagePath, thumbnailPath) {
        try {
            const thumbnailDir = this.path.dirname(thumbnailPath);
            await this.fs.mkdir(thumbnailDir, { recursive: true }); // 確保縮略圖目錄存在
            await sharp(imagePath)
                .resize({ width: 100, height: 100, fit: 'inside' }) // 設置縮略圖大小並保持原圖比例
                .toFile(thumbnailPath);
            console.log(`Thumbnail generated: ${thumbnailPath}`);
        } catch (err) {
            console.error(`Error generating thumbnail: ${thumbnailPath}`, err);
            throw err;
        }
    }
}

module.exports = { ImageHandler };