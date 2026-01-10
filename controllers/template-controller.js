// controllers/sectionTemplateController.js
const { SectionTemplate } = require("../models/sectiontemplate-model");
const SectionMaster = require("../models/sectionmaster-model");
const mongoose = require("mongoose");
const path = require("path"); 
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
const saveDynamicTemplateData = async (req, res) => {
  try {
    const { celebId, templateId } = req.body;

    if (!celebId || !templateId) {
      return res.status(400).json({ success: false, msg: "Missing IDs" });
    }

    // ✅ Build nested data structure dynamically from FormData fields
    const data = {};
    for (const key in req.body) {
      if (key.includes(".")) {
        const [section, field] = key.split(".");
        if (!data[section]) data[section] = {};
        data[section][field.replace("[]", "")] = req.body[key];
      }
    }

    // ✅ Handle uploaded files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const [section, field] = file.fieldname.split(".");
        if (!data[section]) data[section] = {};
        data[section][field] = `/template/${file.filename}`;
      });
    }

    // ✅ Now save section-wise data dynamically
    for (const sectionName of Object.keys(data)) {
      const sectionData = data[sectionName];

      const fields = {};
      for (const key of Object.keys(sectionData)) {
        fields[key] = { type: mongoose.Schema.Types.Mixed };
      }

      fields.celebId = { type: String };
      fields.templateId = { type: String };
      fields.createdAt = { type: Date, default: Date.now };

      const modelName = sectionName.toLowerCase();
      const DynamicModel =
        mongoose.models[modelName] ||
        mongoose.model(modelName, new mongoose.Schema(fields));

      const doc = new DynamicModel({ ...sectionData, celebId, templateId });
      await doc.save();
    }

    res.json({ success: true, msg: "Data saved successfully" });
  } catch (err) {
    console.error("Error saving dynamic template data:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

module.exports = { getSectionTemplateById,saveDynamicTemplateData };
