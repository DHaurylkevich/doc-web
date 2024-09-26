const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('doctors', {
    doctor_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    specialty: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    center_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'medical_centers',
        key: 'center_id'
      }
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    building_number: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    apartment_number: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    postal_code: {
      type: DataTypes.CHAR(6),
      allowNull: true
    },
    pesel: {
      type: DataTypes.CHAR(11),
      allowNull: true,
      unique: "pesel"
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    rating: {
      type: DataTypes.DECIMAL(3,2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'doctors',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
        ]
      },
      {
        name: "pesel",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "pesel" },
        ]
      },
      {
        name: "user_id",
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "fk_doctor_center_id",
        using: "BTREE",
        fields: [
          { name: "center_id" },
        ]
      },
    ]
  });
};
