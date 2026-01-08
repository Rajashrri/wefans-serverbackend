const { Celebraty } = require("../models/celebraty-model");
const { Language } = require("../models/language-model");
const Professionalmaster = require("../models/professionalmaster-model");
const { SocialLink } = require("../models/sociallink-model");
const { Moviev } = require("../models/moviev-model");
const { Series } = require("../models/series-model");
const { Positions } = require("../models/positions-model");
const { Election } = require("../models/election-model");
const Timeline = require("../models/timeline-model");
const { Triviaentries } = require("../models/triviaentries-model");

function createCleanUrl(title) {
  // Convert the title to lowercase
  let cleanTitle = title.toLowerCase();
  // Remove special characters, replace spaces with dashes
  cleanTitle = cleanTitle.replace(/[^\w\s-]/g, "");
  cleanTitle = cleanTitle.replace(/\s+/g, "-");

  return cleanTitle;
}

// ✅ Get category dropdown options
const sociallist = async (req, res) => {
  try {
    const categories = await SocialLink.find({ status: 1 });
    if (!categories.length)
      return res.status(404).json({ msg: "No categories found" });
    res.status(200).json({ msg: categories });
  } catch (error) {
    console.error("Category Fetch Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
//add project
const languageOptions = async (req, res) => {
  try {
    const item = await Language.find({ status: 1 });
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

const professionsOptions = async (req, res) => {
  try {
    const item = await Professionalmaster.find({ status: 1 });
    if (!item) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({
      msg: item,
    });
  } catch (error) {
    console.log(`Category ${error}`);
  }
};
const getClientOptionsTable = async (req, res) => {
  try {
    const categories = await Client.find({}, "_id name"); // Fetch only ID & name

    res.status(200).json({
      success: true,
      msg: categories, // Return category data
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};
const getProfessions = async (req, res) => {
  try {
    const professions = await Professionalmaster.find({}, "_id name").sort({
      name: 1,
    });
    res.status(200).json(professions);
  } catch (error) {
    console.error("Error fetching professions:", error);
    res.status(500).json({ message: "Failed to fetch professions", error });
  }
};

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

const addcelebraty = async (req, res) => {
  try {
    const {
      name,
      slug,
      shortinfo,
      biography,
      statusnew,
      professions,
      languages,
      socialLinks,
      createdBy,
    } = req.body;

    // ✅ Single image filename
    const profileImage = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;

    // ✅ Multiple gallery filenames
    const galleryImages = req.files?.gallery
      ? req.files.gallery.map((file) => file.filename)
      : [];

    const url = createCleanUrl(req.body.name);
    const now = new Date(); // ✅ Define now
    const createdAt = formatDateDMY(now); // 👈 formatted date

    // Optional: check duplicate title
    const existingCelebraty = await Celebraty.findOne({ name });
    if (existingCelebraty) {
      return res
        .status(400)
        .json({ msg: "Celebraty with this name already exists" });
    }
    let parsedSocialLinks = [];
    try {
      parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : [];
    } catch (err) {
      console.error("Invalid socialLinks JSON:", err);
    }

    const newCelebraty = await Celebraty.create({
      name,
      slug,
      shortinfo,
      biography,
      statusnew,
      professions,
      languages,
      socialLinks: parsedSocialLinks,
      createdAt,
      status: "1",
      url,
      createdBy,
      image: profileImage,
      gallery: galleryImages, // ✅ multiple paths
    });

    res.status(201).json({
      status: true,
      msg: "Celebraty added successfully",
      data: newCelebraty,
    });
  } catch (error) {
    console.error("Add Celebraty Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

//update status

const updateStatus = async (req, res) => {
  try {
    const { status, id } = req.body;

    const result = await Celebraty.updateOne(
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

//update

const updatecelebraty = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      slug,
      shortinfo,
      biography,
      statusnew,
      professions,
      languages,
      oldGallery,
      socialLinks,
    } = req.body;

    const profileImage = req.files?.image?.[0]
      ? req.files.image[0].filename
      : null;

    const newGalleryImages = req.files?.gallery
      ? req.files.gallery.map((file) => file.filename)
      : [];

    // ✅ Merge old + new gallery
    let mergedGallery = [];
    if (oldGallery) {
      try {
        mergedGallery = JSON.parse(oldGallery);
      } catch {
        mergedGallery = [];
      }
    }
    mergedGallery = [...mergedGallery, ...newGalleryImages];

    const url = createCleanUrl(name);
    let parsedSocialLinks = [];
    try {
      parsedSocialLinks = socialLinks ? JSON.parse(socialLinks) : [];
    } catch (err) {
      console.error("Invalid socialLinks JSON:", err);
    }

    const updateData = {
      name,
      slug,
      shortinfo,
      biography,
      statusnew,
      professions,
      languages,
      url,
      socialLinks: parsedSocialLinks,

      updatedAt: new Date(),
    };

    if (profileImage) updateData.image = profileImage;
    if (mergedGallery.length > 0) updateData.gallery = mergedGallery;

    const result = await Celebraty.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      status: true,
      msg: "Updated Successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update Celebraty Error:", error);
    res.status(500).json({ status: false, msg: "Server error", error });
  }
};

//get table data

const getdata = async (req, res) => {
  try {
    const response = await Celebraty.find();
    if (!response) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    console.log(`project ${error}`);
  }
};

//delete

const deletecelebraty = async (req, res) => {
  try {
    const id = req.params.id;

    // ✅ Step 1: Check if celebrity exists
    const celeb = await Celebraty.findById(id);
    if (!celeb) {
      return res.status(404).json({
        status: false,
        msg: "No Celebrity Found",
      });
    }

    // ✅ Step 2: Delete all movies linked to this celebrity
    const deletedMovies = await Moviev.deleteMany({ celebrityId: id });
    const deletedSeries = await Series.deleteMany({ celebrityId: id });
    const deletedElection = await Election.deleteMany({ celebrityId: id });
    const deletedPositions = await Positions.deleteMany({ celebrityId: id });
    const deletedTimeline = await Timeline.deleteMany({ celebrityId: id });
    const deleteTriviaentries = await Triviaentries.deleteMany({
      celebrityId: id,
    });
    // ✅ Step 3: Delete the celebrity itself
    await Celebraty.findByIdAndDelete(id);

    return res.status(200).json({
      status: true,
      msg: "Celebrity and related movies deleted successfully",
      deletedMoviesCount: deletedMovies.deletedCount,
      deletedSeriesCount: deletedSeries.deletedCount,
      deletedElectionCount: deletedElection.deletedCount,
      deletedPositionsCount: deletedPositions.deletedCount,
      deletedTimelineCount: deletedTimeline.deletedCount,
      deleteTriviaentriesCount: deleteTriviaentries.deletedCount,
    });
  } catch (error) {
    console.error("❌ Delete celebraty error:", error);
    res.status(500).json({
      status: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

//for edit

// backend: controller
const getcelebratyByid = async (req, res) => {
  try {
    const project = await Celebraty.findOne({ _id: req.params.id });

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
  addcelebraty,
  professionsOptions,
  languageOptions,
  updateStatus,
  updatecelebraty,
  getdata,
  deletecelebraty,
  getcelebratyByid,
  sociallist,
  getProfessions,
};
