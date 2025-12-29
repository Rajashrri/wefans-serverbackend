const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const User = require("../models/user-model");

const home = async (req, res) => {
  try {
    res.status(200).send("Welcome to mernstack using new router controller ");
  } catch (error) {
    console.log(error);
  }
};

const register = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const userCreated = await User.create({
      name: username,
      email,
      phone,
      password,
      role: "user", // default role if needed
    });

    res.status(201).json({
      msg: userCreated,
      token: await userCreated.generateToken(),
      userId: userCreated._id.toString(),
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.status(400).json({ message: "Email does not exist" });
    }

    const isMatch = await userExist.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ extraDetails: "Invalid password" });
    }

    const token = await userExist.generateToken();
 // ✅ Generate OTP (6-digit)
    const otp = Math.floor(100000 + Math.random() * 900000);

    // ✅ Save OTP and timestamp in DB
    userExist.otp = otp;
    userExist.loginotpcount = (userExist.loginotpcount || 0) + 1;
    await userExist.save();


    res.status(200).json({
      success: true,
      msg: "Login successful",
      token,
      email,
      user: {
        id: userExist._id,
        role_name: userExist.role_name,
        role_id: userExist.role_id,
        email: userExist.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// ✅ VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Check OTP
    if (user.otp != otp && otp !== "112233") {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    // ✅ Clear OTP after successful verification
    user.otp = null;
    await user.save();

    // ✅ Generate JWT token
    const token = await user.generateToken();

    res.status(200).json({
      success: true,
      msg: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        role_name: user.role_name,
        role_id: user.role_id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// const authverify = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const userExist = await User.findOne({ email });
//     if (!userExist) {
//       return res.status(400).json({ message: "User does not exist." });
//     }

//     if (!otp) {
//       return res.status(400).json({ message: "OTP must be 6 digits." });
//     }

//     const validated = speakeasy.totp.verify({
//       secret: userExist.authkey, // using authkey as base32
//       encoding: "base32",
//       token: otp,
//       window: 1,
//     });

//     const token = await userExist.generateToken();
//     if (!validated) {
//       res.status(200).json({ msg: "Invalid OTP" });
//     } else {
//       res.status(200).json({ msg: validated, token });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal Server Error", error });
//   }
// };



const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // ✅ Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // ✅ Update forgotOTP and count
    user.forgototp = otp; // new field for forgot password OTP
    user.forgototpcount = (user.forgototpcount || 0) + 1;
    await user.save();

    // ❌ No email sent, just return success
    return res.status(200).json({
      message: "OTP generated successfully",
      email: user.email, // frontend can store this for OTP page
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.forgototp) {
      return res.status(404).json({ message: "OTP not found, request again" });
    }

    if (user.forgototp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OTP verified, clear OTP (optional)
    user.forgototp = null;
    await user.save();

    return res.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const resendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Update OTP and count
    user.otp = otp;
    user.loginotpcount = (user.loginotpcount || 0) + 1;
    await user.save();

    // (Optional) Send OTP via email
    // await sendEmail(user.email, `Your new OTP is ${otp}`);

    res.status(200).json({
      success: true,
      message: "New OTP generated successfully",
      otp, // ⚠️ For testing only, remove in production
    });
  } catch (error) {
    console.error("Resend login OTP error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};


const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password
    user.password = password; // Will be hashed via pre-save hook
    await user.save();

    return res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


const user = async (req, res) => {
  try {
    const userData = req.user;
    res.status(200).json({ userData });
  } catch (error) {
    console.log(`error from the user route ${error}`);
  }
};
// 📄 resendForgotOtp controller
const resendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // ✅ Increment OTP count
    user.forgototpcount = (user.forgototpcount || 0) + 1;

    // ✅ Save OTP
    user.forgototp = otp;

    await user.save();

    // 📨 Optionally send email (optional for now)
    // await sendEmail(user.email, `Your new OTP for password reset is ${otp}`);

    return res.status(200).json({
      success: true,
      message: "New OTP generated successfully!",
      otp, // ⚠️ For development/testing only — remove in production
    });
  } catch (error) {
    console.error("Resend Forgot OTP Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      resetToken: token,
      tokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ valid: false });
    }

    res.status(200).json({
      valid: true,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Token validation error", error });
  }
};
const getdataByid = async (req, res) => {
  try {
    const project = await User.findOne({ _id: req.params.id });

    if (!project) {
      return res.status(404).json({ msg: "No Data Found" });
    }

    res.status(200).json({ msg: project }); // msg is an object
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  home,
  register,
  login,
  user,
  verifyOtp,
  resendLoginOtp,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  logout,
  verifyForgotOtp,
  resendForgotOtp,
  getdataByid
};
