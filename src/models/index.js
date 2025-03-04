const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./sequelize');  // 引入上一步建立的 sequelize 連線

const db = {};

// 載入 Favorite 模型
db.Favorite = require('./favorite.js')(sequelize, DataTypes);

// 設定模型關聯（如果有的話）
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// 將 Sequelize 實例與所有模型匯出
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
