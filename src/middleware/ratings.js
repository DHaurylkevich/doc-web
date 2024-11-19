// "use strict";
// const { Model } = require("sequelize");
// module.exports = (sequelize, DataTypes) => {
//     class Ratings extends Model {
//         static associate(models) {
//             Ratings.belongsTo(models.Users, {
//                 foreignKey: "user_id",
//                 as: "user",
//                 onDelete: "CASCADE",
//                 onUpdate: "CASCADE",
//             });
//         }
//     }
//     Ratings.init({
//         id: {
//             type: DataTypes.INTEGER,
//             autoIncrement: true,
//             primaryKey: true,
//         },
//         user_id: {
//             type: DataTypes.INTEGER,
//             allowNull: false,
//         },
//         total_rating: {
//             type: DataTypes.INTEGER,
//             allowNull: true,
//             validate: {
//                 min: 1,
//                 max: 5,
//             },
//         },
//         votes: {
//             type: DataTypes.INTEGER,
//             allowNull: true,
//         },
//     }, {
//         sequelize,
//         modelName: "Ratings",
//         timestamps: true,
//     });
//     return Ratings;
// };

