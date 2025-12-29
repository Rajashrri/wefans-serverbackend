const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ✅ fixed typo
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  otp: String,
  profile_pic: String,
  loginotpcount: Number,
  role: { type: String, default: "user" },
  createdby: String,
  status: { type: String, default: "Active" },
  resetToken: String,
  tokenExpire: { type: Date }, // ✅ fixed type
  authkey: String,
   forgototp: String,
forgototpcount: Number,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      userId: this._id.toString(),
      email: this.email,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "30d" }
  );
};

module.exports = mongoose.model("User", userSchema);
