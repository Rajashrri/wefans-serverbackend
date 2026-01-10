// controllers/sectionTemplateController.js
const { SectionTemplate } = require("../models/sectiontemplate-model");
const SectionMaster = require("../models/sectionmaster-model");

const getSectionTemplateById = async (req, res) => {
  try {
    const templateId = req.params.id;

    // 1️⃣ Fetch the template
    const template = await SectionTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ status: false, msg: "Template not found" });
    }

    // 2️⃣ Fetch all sections from sectionmasters that match the IDs in template.sections
    const sections = await SectionMaster.find({
      _id: { $in: template.sections },
    });

    // 3️⃣ Return template with populated sections
    const populatedTemplate = {
      ...template.toObject(),
      sections, // now sections contain full section master documents with fieldsConfig
    };

    res.json({ status: true, data: populatedTemplate });
  } catch (error) {
    console.error("Error fetching template with sections:", error);
    res.status(500).json({ status: false, msg: "Server Error" });
  }
};


module.exports = { getSectionTemplateById };
