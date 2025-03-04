const db = require('../models');

class FavoriteController {
    async isFavorited(folder) {
        const favorite = await db.Favorite.findOne({ where: { folder } });
        return !!favorite;
    }

    async addFavorite(folder) {
        await db.Favorite.create({ folder });
    }

    async removeFavorite(folder) {
        await db.Favorite.destroy({ where: { folder } });
    }
}

module.exports = { FavoriteController };