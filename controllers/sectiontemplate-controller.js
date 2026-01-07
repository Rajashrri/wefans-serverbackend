const { SectionTemplate } = require("../models/sectiontemplate-model");
const SectionMaster = require("../models/sectionmaster-model");

function createCleanUrl(title) {
  // Convert the title to lowercase
  let cleanTitle = title.toLowerCase();
  // Remove special characters, replace spaces with dashes
  cleanTitle = cleanTitle.replace(/[^\w\s-]/g, "");
  cleanTitle = cleanTitle.replace(/\s+/g, "-");

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


//add project
const sectionsOptions = async (req, res) => {
  try {
    const item = await SectionMaster.find({ status: 1 });
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

// -----------Category Features------------------
//add fixed item
const addsectiontemplate = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { title, sections = [], createdBy } = req.body;
    const status = 1;

    // Utility functions (assuming you already have them)
    const url = createCleanUrl(title);
    const now = new Date();
    const createdAt = formatDateDMY(now);

    // ✅ Check if a template with same title already exists
    const existingTemplate = await SectionTemplate.findOne({ title: title.trim() });
    if (existingTemplate) {
      return res.status(400).json({ msg: "Section Template already exists" });
    }

    // ✅ Create new Section Template document
    const newTemplate = await SectionTemplate.create({
      title,
      sections, // array of section IDs
      status,
      createdBy,
      url,
      createdAt,
    });

    return res.status(201).json({
      msg: "Section Template created successfully",
      data: newTemplate,
      success: true,
    });
  } catch (error) {
    console.error("Add Section Template Error:", error);
    return res.status(500).json({
      msg: "Server error",
      success: false,
      error: error.message,
    });
  }
};

const getdatasectiontemplate = async (req, res) => {
  try {
    const response = await SectionTemplate.find();
    if (!response) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    console.log(`FixedItem ${error}`);
  }
};

const getsectiontemplateByid = async (req, res) => {
  const id = req.params.id;
  try {
    const response = await SectionTemplate.find({ _id: id });
    if (!response) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }
    res.status(200).json({ msg: response });
  } catch (error) {
    console.error("Error in getdata:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.msg });
  }
};
const updateSectionTemplate = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, sections = [] } = req.body;

    // 🔹 1. Find existing template
    const existingTemplate = await SectionTemplate.findById(id);
    if (!existingTemplate) {
      return res.status(404).json({ success: false, msg: "Section Template not found" });
    }

    // 🔹 2. Check for duplicate title (case-insensitive)
    const duplicate = await SectionTemplate.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        msg: "Section Template already exists",
      });
    }

    // 🔹 3. Generate clean URL
    const url = createCleanUrl(title);

    // 🔹 4. Update template
    const updatedTemplate = await SectionTemplate.findByIdAndUpdate(
      id,
      { $set: { title, sections, url } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      msg: "Section Template updated successfully",
      data: updatedTemplate,
    });
  } catch (error) {
    console.error("Error updating Section Template:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: error.message,
    });
  }
};



const updateStatusCategory = async (req, res) => {
  try {
    const { status, id } = req.body;

    const result = await SectionTemplate.updateOne(
      { _id: id },
      {
        $set: {
          status: status,
        },
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      msg: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deletesectiontemplate = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Find the role
    const role = await SectionTemplate.findById(id);
    if (!role) {
      return res.status(404).json({ msg: "SectionTemplate not found" });
    }

    // 2. Delete related privileges

    // 3. Delete the role itself
    const deleted = await SectionTemplate.findByIdAndDelete(id);

    res
      .status(200)
      .json({ msg: "SectionTemplate and  deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting SectionTemplate:", error);
    res.status(500).json({ error: error.message });
  }
};

const categoryOptions = async (req, res) => {
  try {
    const item = await Category.find({ status: 1 });
    if (!item) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({
      msg: item,
    });
  } catch (error) {
    console.log(`SectionTemplate ${error}`);
  }
};

module.exports = {
  addsectiontemplate,
  getdatasectiontemplate,
  getsectiontemplateByid,
  updateSectionTemplate,
  deletesectiontemplate,
  categoryOptions,
  updateStatusCategory,
  sectionsOptions,
};
