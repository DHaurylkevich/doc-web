const sequelize = require("../config/db");

var DataTypes = require("sequelize").DataTypes;
var _admin_logs = require("./admin_logs");
var _appointments = require("./appointments");
var _clinic_reviews = require("./clinic_reviews");
var _doctor_reviews = require("./doctor_reviews");
var _doctors = require("./doctors");
var _medical_centers = require("./medical_centers");
var _patients = require("./patients");
var _users = require("./users");

function initModels(sequelize) {
  var admin_logs = _admin_logs(sequelize, DataTypes);
  var appointments = _appointments(sequelize, DataTypes);
  var clinic_reviews = _clinic_reviews(sequelize, DataTypes);
  var doctor_reviews = _doctor_reviews(sequelize, DataTypes);
  var doctors = _doctors(sequelize, DataTypes);
  var medical_centers = _medical_centers(sequelize, DataTypes);
  var patients = _patients(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);

  appointments.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(appointments, { as: "appointments", foreignKey: "doctor_id"});
  doctor_reviews.belongsTo(doctors, { as: "doctor", foreignKey: "doctor_id"});
  doctors.hasMany(doctor_reviews, { as: "doctor_reviews", foreignKey: "doctor_id"});
  appointments.belongsTo(medical_centers, { as: "center", foreignKey: "center_id"});
  medical_centers.hasMany(appointments, { as: "appointments", foreignKey: "center_id"});
  clinic_reviews.belongsTo(medical_centers, { as: "clinic", foreignKey: "clinic_id"});
  medical_centers.hasMany(clinic_reviews, { as: "clinic_reviews", foreignKey: "clinic_id"});
  doctors.belongsTo(medical_centers, { as: "center", foreignKey: "center_id"});
  medical_centers.hasMany(doctors, { as: "doctors", foreignKey: "center_id"});
  users.belongsTo(medical_centers, { as: "center", foreignKey: "center_id"});
  medical_centers.hasMany(users, { as: "users", foreignKey: "center_id"});
  appointments.belongsTo(patients, { as: "patient", foreignKey: "patient_id"});
  patients.hasMany(appointments, { as: "appointments", foreignKey: "patient_id"});
  clinic_reviews.belongsTo(patients, { as: "patient", foreignKey: "patient_id"});
  patients.hasMany(clinic_reviews, { as: "clinic_reviews", foreignKey: "patient_id"});
  doctor_reviews.belongsTo(patients, { as: "patient", foreignKey: "patient_id"});
  patients.hasMany(doctor_reviews, { as: "doctor_reviews", foreignKey: "patient_id"});
  admin_logs.belongsTo(users, { as: "admin", foreignKey: "admin_id"});
  users.hasMany(admin_logs, { as: "admin_logs", foreignKey: "admin_id"});
  doctors.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(doctors, { as: "doctors", foreignKey: "user_id"});
  patients.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(patients, { as: "patients", foreignKey: "user_id"});
  
  return {
    admin_logs,
    appointments,
    clinic_reviews,
    doctor_reviews,
    doctors,
    medical_centers,
    patients,
    users,
  };
}

const models = initModels(sequelize);

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
module.exports.models = models;