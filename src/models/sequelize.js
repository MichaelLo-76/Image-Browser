const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'data', 'database.sqlite'), // ✅ SQLite 存在 /app/data/
    logging: false // 取消日誌輸出
});

sequelize.authenticate()
    .then(() => console.log('✅ SQLite 資料庫已連接'))
    .catch(err => console.error('❌ 無法連接 SQLite:', err));

module.exports = sequelize;
