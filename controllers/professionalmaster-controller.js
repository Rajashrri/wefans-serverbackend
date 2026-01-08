const Professionalmaster = require("../models/professionalmaster-model");
const { SectionTemplate } = require("../models/sectiontemplate-model");

const fs = require("fs");
const path = require("path");
// Utility: Create clean URL from title
function createCleanUrl(title) {
  let cleanTitle = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
  return cleanTitle;
}
const SectionTemplateOptions = async (req, res) => {
  try {
    const item = await SectionTemplate.find({ status: 1 });
    if (!item) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({
      msg: item,
    });
  } catch (error) {
    console.log(`Language ${error}`);
  }
};
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

// Create new Professionalmaster
const addprofessional = async (req, res) => {
  try {
    console.log("Incoming Body:", req.body);

    // ✅ Parse sectiontemplate if it comes as JSON string
    let sectiontemplate = [];
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = JSON.parse(req.body.sectiontemplate);
      } catch (err) {
        console.warn("Failed to parse sectiontemplate JSON:", err.message);
      }
    }

    const { name, slug, createdBy } = req.body;
    const url = createCleanUrl(name);
    const mainImage = req.files?.image?.[0]?.filename || "";
    const now = new Date();
    const createdAt = formatDateDMY(now);

    // ✅ Check if professionalmaster already exists (by name or slug)
    const existingProfessional = await Professionalmaster.findOne({
      $or: [{ name: name }, { slug: slug }],
    });

    if (existingProfessional) {
      return res.status(400).json({
        success: false,
        msg: "professionalmaster already exist",
      });
    }

    // ✅ Create new Professionalmaster
    const newProfessional = new Professionalmaster({
      name,
      slug,
      image: mainImage,
      sectiontemplate,
      status: 1,
      createdAt,
      url,
      createdBy,
    });

    await newProfessional.save();

    res.status(201).json({
      success: true,
      msg: "Professionalmaster added successfully",
      data: newProfessional,
    });
  } catch (error) {
    console.error("Add Professionalmaster Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};


const updateprofessional = async (req, res) => {
  try {
    const professionalmasterId = req.params.id;
    const { name, slug } = req.body;

    // ✅ Parse sectiontemplate (array of IDs)
    let sectiontemplate = [];
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = JSON.parse(req.body.sectiontemplate);
      } catch (err) {
        console.warn("Failed to parse sectiontemplate JSON:", err.message);
      }
    }

    // ✅ Find existing document
    const professionalmaster = await Professionalmaster.findById(
      professionalmasterId
    );
    if (!professionalmaster) {
      return res
        .status(404)
        .json({ success: false, msg: "Profession master not found" });
    }

    // ✅ Check for duplicate name or slug in other records
    if (name || slug) {
      const duplicate = await Professionalmaster.findOne({
        $and: [
          { _id: { $ne: professionalmasterId } }, // exclude current
          {
            $or: [
              { name: name || professionalmaster.name },
              { slug: slug || professionalmaster.slug },
            ],
          },
        ],
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          msg: "professionalmaster already exist",
        });
      }
    }

    // ✅ Update simple fields
    if (name) professionalmaster.name = name;
    if (slug) professionalmaster.slug = slug;
    if (Array.isArray(sectiontemplate)) {
      professionalmaster.sectiontemplate = sectiontemplate;
    }

    // ✅ Handle image update
    const newImageFile =
      (req.files && req.files.image && req.files.image[0]) || req.file;

    if (newImageFile) {
      // delete old image if exists
      if (professionalmaster.image) {
        const oldPath = path.join(
          __dirname,
          "../public/professionalmaster/",
          professionalmaster.image
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      professionalmaster.image = newImageFile.filename;
    }

    await professionalmaster.save();

    res.status(200).json({
      success: true,
      msg: "Profession master updated successfully",
      data: professionalmaster,
    });
  } catch (error) {
    console.error("Error updating Profession master:", error);
    res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    await Professionalmaster.updateOne(
      { _id: id },
      { $set: { status } },
      { new: true }
    );

    res.status(200).json({ msg: "Status updated successfully" });
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
    const professionalmaster = await Professionalmaster.findOne({
      _id: req.params.id,
    });

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
  SectionTemplateOptions,
};
