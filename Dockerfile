# 使用 Alpine Linux 作為基礎映像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 到工作目錄
COPY package*.json ./

# 安裝項目依賴
RUN npm install

# 將應用程序的源代碼複製到工作目錄
COPY . .

# 暴露應用程序運行的端口
EXPOSE 3000
EXPOSE 3001

# 啟動應用程序
CMD ["npm", "start"]