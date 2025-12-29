const bcrypt = require("bcryptjs");

const User = require("../models/user-model"); // ✅ fix: import model


function createCleanUrl(title) {
  // Convert the title to lowercase
  let cleanTitle = title.toLowerCase();
  // Remove special characters, replace spaces with dashes
  cleanTitle = cleanTitle.replace(/[^\w\s-]/g, "");
  cleanTitle = cleanTitle.replace(/\s+/g, "-");

  return cleanTitle;
}
const updateprofile = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    console.log("📥 Incoming ID:", id);
    console.log("📦 updateData (from body):", updateData);
    console.log("📸 Uploaded file:", req.file);

    if (req.file) {
      updateData.profile_pic = req.file.filename;
    }

    const updatedProfile = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    console.log("🧾 Updated profile:", updatedProfile);

    if (!updatedProfile) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({
      msg: "Profile updated successfully",
      user: updatedProfile,
    });
  } catch (error) {
    console.error("❌ Error in updateprofile:", error);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

const updatepassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { current_password, new_password, confirm_password } = req.body;

    // ✅ Basic validations
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ✅ Compare current password (hashed)
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "wrong_password" });
    }

    // ✅ Hash new password before saving
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(new_password, salt);
    // user.password = hashedPassword;
user.password = new_password; // Will be hashed via pre-save hook
    await user.save();

    res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error in updatepassword:", error.message);
    res.status(500).json({
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};



const getdatabyid = async(req, res) => {
    try {
        const id = req.params.id;
        const response = await User.findOne({ _id: id });
        if(!response){
            res.status(404).json({msg:"No Data Found"});
            return;
        }
        res.status(200).json({msg:response});
    } catch (error) {
        console.log(`Customer ${error}`);
    }
};

module.exports = { updateprofile , getdatabyid,updatepassword};
