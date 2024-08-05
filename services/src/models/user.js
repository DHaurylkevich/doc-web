const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { hashingPassword } = require("../utils/passwordOperation");

const userSchema = mongoose.Schema({
        name: {
          type: String,
          required: true
        },
        email: {
          type: String,
          required : true,
          unique: true
        },
        password: {
          type: String,
          required: true
        },
        roles: { 
          type: String,
          enum: ["admin", "doctor", "patient",],
          default: "patient"
        }
      });

userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) {
          next();
        }
        this.password = await hashingPassword(this.password)
        next();
      });

const User = mongoose.model("User", userSchema);
module.exports = User;