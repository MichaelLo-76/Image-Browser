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

    async listFavorites() {
        const favorites = await db.Favorite.findAll({ attributes: ['folder'] });
        return favorites.map(fav => fav.folder);
    }
}

module.exports = { FavoriteController };