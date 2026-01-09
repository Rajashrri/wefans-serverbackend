const { Schema, model } = require("mongoose");

const privilegeSchema = new Schema({
  role: { type: String },
  role_id: { type: String },

  // Profession Master
  professionmasteradd: { type: String },
  professionmasterupdate: { type: String },
  professionmasterdelete: { type: String },
  professionmasterlist: { type: String },
  professionmasterview: { type: String },

  // Language Master
  languagemasteradd: { type: String },
  languagemasterupdate: { type: String },
  languagemasterdelete: { type: String },
  languagemasterlist: { type: String },
  languagemasterview: { type: String },

  // Trivia Types
  triviatypesadd: { type: String },
  triviatypesupdate: { type: String },
  triviatypesdelete: { type: String },
  triviatypeslist: { type: String },
  triviatypesview: { type: String },

  // Social Links
  sociallinksadd: { type: String },
  sociallinksupdate: { type: String },
  sociallinksdelete: { type: String },
  sociallinkslist: { type: String },
  sociallinksview: { type: String },

  // Genre Master
  genremasteradd: { type: String },
  genremasterupdate: { type: String },
  genremasterdelete: { type: String },
  genremasterlist: { type: String },
  genremasterview: { type: String },

  // Celebrity
  celebrityadd: { type: String },
  celebrityupdate: { type: String },
  celebritydelete: { type: String },
  celebritylist: { type: String },
  celebrityview: { type: String },

  // Section Types Master
  sectiontypesmasteradd: { type: String },
  sectiontypesmasterupdate: { type: String },
  sectiontypesmasterdelete: { type: String },
  sectiontypesmasterlist: { type: String },
  sectiontypesmasterview: { type: String },

  // Section Template
  sectiontemplateadd: { type: String },
  sectiontemplateupdate: { type: String },
  sectiontemplatedelete: { type: String },
  sectiontemplatelist: { type: String },
  sectiontemplateview: { type: String },
});

module.exports = model("Privilege", privilegeSchema);
