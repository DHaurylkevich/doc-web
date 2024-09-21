const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('appointments', {
    appointment_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'patient_id'
      }
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'doctors',
        key: 'doctor_id'
      }
    },
    appointment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled','completed','canceled'),
      allowNull: false,
      defaultValue: "scheduled"
    },
    visit_type: {
      type: DataTypes.ENUM('prywatna','NFZ'),
      allowNull: false
    },
    center_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medical_centers',
        key: 'center_id'
      }
    },
    visit_purpose: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    first_visit: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    documents: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'appointments',
    timestamps: true,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "appointment_id" },
        ]
      },
      {
        name: "patient_id",
        using: "BTREE",
        fields: [
          { name: "patient_id" },
        ]
      },
      {
        name: "doctor_id",
        using: "BTREE",
        fields: [
          { name: "doctor_id" },
        ]
      },
      {
        name: "center_id",
        using: "BTREE",
        fields: [
          { name: "center_id" },
        ]
      },
    ]
  });
};
