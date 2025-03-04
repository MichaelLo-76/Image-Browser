const db = require('./models');

db.sequelize.sync()
    .then(() => console.log('✅ SQLite 資料表同步完成'))
    .catch(err => console.error('❌ SQLite 資料表同步失敗:', err));

