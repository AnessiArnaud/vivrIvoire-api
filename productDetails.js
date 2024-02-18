const mongoose = require("mongoose");

const ProductDetailsScehma = new mongoose.Schema(
  {
    type: String,
    quantity: Number,
    city:String,
    image: Buffer, 
    contentType: String
  },
  {
    collection: "Produits",
  }
);

mongoose.model("Produits", ProductDetailsScehma);
