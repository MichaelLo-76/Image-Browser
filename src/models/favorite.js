module.exports = (sequelize, DataTypes) => {
    const Favorite = sequelize.define('Favorite', {
        folder: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });

    Favorite.associate = function(models) {

    };

    return Favorite;
};