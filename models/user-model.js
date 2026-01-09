const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Clean-up function to remove old 'emp_id' index (runs once when model loads)
(async () => {
  try {
    const db = mongoose.connection;
    if (db.readyState === 1) {
      const indexes = await db.collection("users").getIndexes();
      if (indexes["emp_id_1"]) {
        console.log("🧹 Removing old emp_id index...");
        await db.collection("users").dropIndex("emp_id_1");
        console.log("✅ emp_id index removed successfully");
      }
    } else {
      mongoose.connection.once("open", async () => {
        const indexes = await mongoose.connection.collection("users").getIndexes();
        if (indexes["emp_id_1"]) {
          console.log("🧹 Removing old emp_id index...");
          await mongoose.connection.collection("users").dropIndex("emp_id_1");
          console.log("✅ emp_id index removed successfully");
        }
      });
    }
  } catch (err) {
    console.warn("⚠️ Failed to remove emp_id index:", err.message);
  }
})();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    pic: {
      type: String,
    },
    pic_url: {
      type: String,
    },
    role_id: {
      type: String,
    },
    role_name: {
      type: String,
    },
    loginotpcount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
    },
    status: {
      type: String,
      default: "1",
    },
    resetToken: {
      type: String,
    },
    tokenExpire: {
      type: String,
    },
    authkey: {
      type: String,
    },
    url: {
      type: String,
    },
    createdAt: {
      type: String,
    },
    updatedAt: {
      type: String,
    },
  },
  { timestamps: false }
);

// 🔒 Hash password before saving
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

// 🔑 Compare entered password with hashed password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// 🧾 Generate JWT Token
userSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
        role: this.role_name,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );
  } catch (error) {
    console.error("Token generation error:", error);
  }
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
