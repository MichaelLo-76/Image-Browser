const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const routes = require('./routes/index');

const app = express();
const PORT = 3000;
const HTTP_PORT = 3001;

// 這會讓 public 資料夾內的所有檔案都變成靜態檔案
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json()); // 確保 Express 解析 JSON
app.use(express.urlencoded({ extended: true })); // 可選，用於處理 URL Encoded 格式
app.use('/api', routes);

// 設定憑證文件
const options = {
    cert: fs.readFileSync(path.join(__dirname, '..', 'cert.pem')),
    key: fs.readFileSync(path.join(__dirname, '..', 'key.pem'))
};

// 啟動 HTTPS 伺服器
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});

// 啟動 HTTP 伺服器作為備用
http.createServer(app).listen(HTTP_PORT, () => {
    console.log(`Server is running on http://localhost:${HTTP_PORT}`);
});