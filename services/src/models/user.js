const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

Schema.pre('save', function (next) {
        const user = this;
        if (this.isModified('password') || this.isNew) {
          bcrypt.genSalt(10, (error, salt) => {
          if (error) return next(error);
          bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) return next(error);
            user.password = hash;
              next();
            });
          });
        } else {
          return next();
        }
      });

const User = mongoose.model("User", userSchema);

module.exports = User;