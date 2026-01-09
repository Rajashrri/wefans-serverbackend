const { Role } = require("../models/role-model");
const Privilege = require("../models/privilege-model"); // ✅ Import the correct model

function createCleanUrl(title) {
  // Convert the title to lowercase
  let cleanTitle = title.toLowerCase();
  // Remove special characters, replace spaces with dashes
  cleanTitle = cleanTitle.replace(/[^\w\s-]/g, "");
  cleanTitle = cleanTitle.replace(/\s+/g, "-");

  return cleanTitle;
}

// -----------Category Features------------------
//add fixed item
const addrole = async (req, res) => {
  try {
    console.log(req.body);
    const { name, createdBy } = req.body;
    const status = "1";
    const url = createCleanUrl(req.body.name);
    const userExist = await Role.findOne({ name });

    if (userExist) {
      return res.status(400).json({ msg: "Role already exist" });
    }

    const cmCreated = await Role.create({ name, status, createdBy, url });
    await Privilege.create({
        role_id: cmCreated._id,  // 👈 Save Role ID here

      role: name,
      empadd: "0",
      empupdate: "0",
      empdelete: "0",
      emplist: "0",

      clientadd: "0",
      clientupdate: "0",
      clientdelete: "0",
      clientlist: "0",

      projectadd: "0",
      projectupdate: "0",
      projectdelete: "0",
      projectlist: "0",

      taskadd: "0",
      taskupdate: "0",
      taskdelete: "0",
      tasklist: "0",
    });

    res.status(201).json({
      msg: cmCreated,
      userId: cmCreated._id.toString(),
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
const getdatarole = async (req, res) => {
  try {
    const response = await Role.find();
    if (!response) {
      res.status(404).json({ msg: "No Data Found" });
      return;
    }

    res.status(200).json({ msg: response });
  } catch (error) {
    console.log(`FixedItem ${error}`);
  }
};

const getroleByid = async (req, res) => {
  const id = req.params.id;
  try {
    const response = await Role.find({ _id: id });
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
const updateRole = async (req, res) => {
  try {
    const id = req.params.id;
    const { name } = req.body;

    // Step 1: Find the current role to get the old name
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ msg: "Role not found" });
    }

    const oldRoleName = existingRole.name;
    const url = createCleanUrl(name);

    // Step 2: Update Role document
    const result = await Role.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          url: url,
        },
      }
    );

    // Step 3: Update Privilege documents where role name matches old name
    await Privilege.updateMany({ role: oldRoleName }, { $set: { role: name } });

    res
      .status(200)
      .json({ msg: "Role and related privileges updated", result });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateStatusRole = async (req, res) => {
  try {
    const { status, id } = req.body;

    const result = await Role.updateOne(
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

const deleterole = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Find the role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ msg: "Role not found" });
    }

    // 2. Delete related privileges
    await Privilege.deleteMany({ role: role.name });

    // 3. Delete the role itself
    const deleted = await Role.findByIdAndDelete(id);

    res
      .status(200)
      .json({ msg: "Role and its privileges deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting role:", error);
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
    console.log(`Category ${error}`);
  }
};

module.exports = {
  addrole,
  getdatarole,
  getroleByid,
  updateRole,
  deleterole,
  categoryOptions,
  updateStatusRole,
};
