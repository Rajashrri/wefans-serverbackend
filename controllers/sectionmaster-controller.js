const SectionMaster = require("../models/sectionmaster-model");
const fs = require("fs");
const path = require("path");
// Utility: Create clean URL from title
function createCleanUrl(name) {
  let cleanTitle = name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
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

// Create new sectionmaster
const addsectionmaster = async (req, res) => {
  try {
    const { name, slug, createdBy, layout, fieldsConfig, is_repeater } =
      req.body;
    const url = createCleanUrl(req.body.name);

    // Handle uploaded media file

    const now = new Date();
    const createdAt = formatDateDMY(now);
    // 🧩 Parse fields configuration (if provided)
    // 🧩 Parse fields configuration (if provided)
    let parsedFields = [];
    if (fieldsConfig) {
      try {
        parsedFields = JSON.parse(fieldsConfig);

        // ✅ Normalize options if present
        parsedFields = parsedFields.map((field) => {
          if (Array.isArray(field.options)) {
            // convert ["A", "B"] → [{label:"A", value:"a"}, {label:"B", value:"b"}]
            field.options = field.options
              .filter((opt) => opt && typeof opt === "string")
              .map((opt) => ({
                label: opt.trim(),
                value: opt.trim().toLowerCase().replace(/\s+/g, "_"),
              }));
          } else {
            field.options = []; // ensure it's always an array
          }
          return field;
        });
      } catch (err) {
        console.error("Invalid fieldsConfig JSON:", err);
      }
    }
    // ✅ Convert to boolean
    const isRepeater = is_repeater === "1" ? true : false;
    const newSectionMaster = new SectionMaster({
      name,
      slug,
      fieldsConfig: parsedFields, // <-- store parsed fields array
      status: 1, // default active
      createdAt,
      url,
      layout,
      isRepeater, // ✅ Save boolean flag in DB
      createdBy,
    });

    await newSectionMaster.save();

    // ✅ Include success flag
    return res.json({
      success: true,
      msg: "SectionMaster added successfully",
      data: newSectionMaster,
    });
  } catch (error) {
    console.error("Add SectionMaster Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};

const updatesectionmaster = async (req, res) => {
  try {
    const { name, slug, layout, fieldsConfig, is_repeater } = req.body;
    const sectionmasterId = req.params.id;

    const sectionmaster = await SectionMaster.findById(sectionmasterId);
    if (!sectionmaster) {
      return res
        .status(404)
        .json({ success: false, msg: "SectionMaster not found" });
    } // ✅ Update repeater flag if provided
    if (typeof is_repeater !== "undefined") {
      sectionmaster.isRepeater = is_repeater === "1";
    }

    // ✅ Update basic fields
    if (name) sectionmaster.name = name;
    if (slug) sectionmaster.slug = slug;
    if (layout) sectionmaster.layout = layout;

    // 🧩 Handle fieldsConfig (with normalization)
    if (fieldsConfig) {
      try {
        let parsedFields = JSON.parse(fieldsConfig).map((f) => ({
          ...f,
          // ensure boolean for isRequired
          isRequired: f.isRequired === true || f.isRequired === "true",
        }));

        // ✅ Normalize options for select fields
        parsedFields = parsedFields.map((field) => {
          if (Array.isArray(field.options)) {
            field.options = field.options
              .filter((opt) => opt && typeof opt === "string")
              .map((opt) => ({
                label: opt.trim(),
                value: opt.trim().toLowerCase().replace(/\s+/g, "_"),
              }));
          } else {
            field.options = [];
          }
          return field;
        });

        sectionmaster.fieldsConfig = parsedFields;
      } catch (err) {
        console.error("Invalid fieldsConfig JSON:", err);
        return res.status(400).json({
          success: false,
          msg: "Invalid fieldsConfig format",
        });
      }
    }

    // ✅ Updated date and user (optional)
    if (req.body.updatedBy) {
      sectionmaster.updatedBy = req.body.updatedBy;
      sectionmaster.updatedAt = new Date();
    }

    await sectionmaster.save();

    res.status(200).json({
      success: true,
      msg: "SectionMaster updated successfully",
      sectionmaster,
    });
  } catch (error) {
    console.error("Error updating SectionMaster:", error);
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

    await SectionMaster.updateOne(
      { _id: id },
      { $set: { status } },
      { new: true }
    );

    res.status(200).json({ msg: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Update SectionMaster

// Get all SectionMasters
const getdata = async (req, res) => {
  try {
    const response = await SectionMaster.find();
    if (!response || response.length === 0) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Delete SectionMaster
const deletesectionmaster = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await SectionMaster.findOneAndDelete({ _id: id });

    if (!response) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: "sectionmaster deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Get sectionmaster by ID
const getsectionmasterByid = async (req, res) => {
  try {
    const sectionmaster = await SectionMaster.findOne({ _id: req.params.id });

    if (!sectionmaster) {
      return res.status(404).json({ msg: "No data found" });
    }

    res.status(200).json({ msg: sectionmaster });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// Export all
module.exports = {
  addsectionmaster,
  updateStatus,
  updatesectionmaster,
  getdata,
  deletesectionmaster,
  getsectionmasterByid,
};
