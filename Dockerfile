# 使用輕量級 Node.js 版本
FROM node:18-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json
COPY package.json ./

# 安裝依賴
RUN npm install

# 複製專案所有檔案
COPY . .

# 確保資料庫目錄存在（SQLite 會儲存在這裡）
RUN mkdir -p /app/data

# 開放 3000, 3001 端口
EXPOSE 3000
EXPOSE 3001

# 啟動應用程式
CMD ["npm", "start"]