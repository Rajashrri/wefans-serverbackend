const Professionalmaster = require("../models/professionalmaster-model");
const fs = require("fs");
const path = require("path");
// Utility: Create clean URL from title
function createCleanUrl(title) {
  let cleanTitle = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  return cleanTitle;
}

// Utility: Format date as dd-mm-yyyy hh:mm:ss
const formatDateDMY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// Create new professionalmaster
const addprofessional = async (req, res) => {
  try {
const { name,slug,createdBy } = req.body;
    const url = createCleanUrl(req.body.name);

   

    // Handle uploaded files
    const mainImage = req.files["image"]
      ? req.files["image"][0].filename
      : "";
    const now = new Date(); // ✅ Define now
    const createdAt = formatDateDMY(now); // 👈 formatted date
    const newBlog = new Professionalmaster({
      name,
        slug,
      image: mainImage,
       status: 1, // default active
       createdAt, // ✅ Define now
       url,
       createdBy
    });

    await newBlog.save();

    res.json({
      msg: "professionalmaster added successfully",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Add professionalmaster Error:", error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

const updateprofessional = async (req, res) => {
  try {
    const { name,slug } = req.body;
    const professionalmasterId = req.params.id;

    const professionalmaster = await Professionalmaster.findById(professionalmasterId);
    if (!professionalmaster) {
      return res.status(404).json({ msg: "professionalmaster not found" });
    }

    // ✅ Update name
    if (name) professionalmaster.name = name;
if (slug) professionalmaster.slug = slug;
    // ✅ Handle file upload
    const newImageFile =
      (req.files && req.files.image && req.files.image[0]) || req.file;

    if (newImageFile) {
      // delete old image if exists
      if (professionalmaster.image) {
        const oldPath = path.join(__dirname, "../public/professionalmaster/", professionalmaster.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      professionalmaster.image = newImageFile.filename;
    }

    await professionalmaster.save();

    res.status(200).json({ msg: "professionalmaster updated successfully", professionalmaster });
  } catch (error) {
    console.error("Error updating professionalmaster:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    await Professionalmaster.updateOne({ _id: id }, { $set: { status } }, { new: true });

    res.status(200).json({ msg: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update professionalmaster



// Get all professionalmasters
const getdata = async (req, res) => {
  try {
    const response = await Professionalmaster.find();
    if (!response || response.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete professionalmaster
const deleteprofessional = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await Professionalmaster.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: "professionalmaster deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get professionalmaster by ID
const getprofessionalByid = async (req, res) => {
  try {
    const professionalmaster = await Professionalmaster.findOne({ _id: req.params.id });

    if (!professionalmaster) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: professionalmaster });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Export all
module.exports = {
  addprofessional,
  updateStatus,
  updateprofessional,
  getdata,
  deleteprofessional,
  getprofessionalByid,
};
