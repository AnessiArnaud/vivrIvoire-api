const mongoose = require("mongoose");

const UserDetailsScehma = new mongoose.Schema(
  {
    name: String,
    type: String,
    mail: { type: String, unique: true },
    pwd: String,
    region: String,
    culture: String,
    tel: String,
    tel2: String
  },
  {
    collection: "Utilisateur",
  }
);

mongoose.model("Utilisateur", UserDetailsScehma);
