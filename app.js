const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
/////////
const multer = require('multer');
const path = require('path');
//////////
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const JWT_SECRET =
  "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";

const mongoUrl = "mongodb+srv://the_gardian:fabbs_agrotech@cluster0.vsnwmpy.mongodb.net/APP3";
 

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

require("./userDetails");
require("./productDetails");

//require("./imageDetails");

//////////
const User = mongoose.model("Utilisateur");
//const Images = mongoose.model("ImageDetails");
const Products=mongoose.model("Produits")

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



app.post("/register", async (req, res) => {
  const { name,type,mail, pwd,city,culture,tel,tel2 } = req.body;

  const encryptedPassword = await bcrypt.hash(pwd, 10);
  try {
    const oldUser = await User.findOne({ mail });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await User.create({
      name,
      type,
      mail,
      pwd: encryptedPassword,
      region:city,
      culture,
      tel,
      tel2
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

app.post("/login-user", async (req, res) => {
  const { mail, pwd } = req.body;

  const user = await User.findOne({ mail });
  if (!user) {
    return res.json({ error: "User Not found" });
  }
  if (await bcrypt.compare(pwd, user.pwd)) {
    const token = jwt.sign({ email: user.mail }, JWT_SECRET, {
      expiresIn: "15m",
    });

    if (res.status(201)) {
      return res.json({ status: "ok", data: token });
    } else {
      return res.json({ error: "error" });
    }
  }
  res.json({ status: "error", error: "InvAlid Password" });
});

app.post("/userData", async (req, res) => {
  const { token } = req.body;
  try {
    const user = jwt.verify(token, JWT_SECRET, (err, res) => {
      if (err) {
        return "token expired";
      }
      return res;
    });
    console.log(user);
    if (user == "token expired") {
      return res.send({ status: "error", data: "token expired" });
    }

    const useremail = user.mail;
    User.findOne({ mail: useremail })
      .then((data) => {
        res.send({ status: "ok", data: data });
      })
      .catch((error) => {
        res.send({ status: "error", data: error });
      });
  } catch (error) { }
});

app.listen(5000, () => {
  console.log("Server Started");
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User Not Exists!!" });
    }
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
      expiresIn: "5m",
    });
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "adarsh438tcsckandivali@gmail.com",
        pass: "rmdklolcsmswvyfw",
      },
    });

    var mailOptions = {
      from: "youremail@gmail.com",
      to: "thedebugarena@gmail.com",
      subject: "Password Reset",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    console.log(link);
  } catch (error) { }
});

//////////////////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////
//////////////CULTURE///////////////
app.get('/articles', async (req, res) => {
  try {
    const articles = await Products.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/save-culture', upload.single('image'), async (req, res) => {
  try {
    const { culture, qty,city } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const cultureData = new Products({
      type: culture,
      quantity: qty,
      city,
      image: imageBuffer,
      contentType: req.file.mimetype  
    });

    await cultureData.save();

    res.status(201).json({ message: 'Données enregistrées avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/get-cultures', async (req, res) => {
  try {
    const cultures = await Products.find();
    res.json(cultures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*app.get("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  console.log(req.params);
  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    res.render("index", { email: verify.email, status: "Not Verified" });
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
});
*/
///////////////////////////////////////////////////////

app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const oldUser = await User.findOne({ _id: id });
  if (!oldUser) {
    return res.json({ status: "User Not Exists!!" });
  }
  const secret = JWT_SECRET + oldUser.password;
  try {
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
    );

    res.render("index", { email: verify.email, status: "verified" });
  } catch (error) {
    console.log(error);
    res.json({ status: "Something Went Wrong" });
  }
});
/*
app.post("/upload-image", async (req, res) => {
  const { base64 } = req.body;
  try {
    await Images.create({ image: base64 });
    res.send({ Status: "ok" })

  } catch (error) {
    res.send({ Status: "error", data: error });

  }
})

app.get("/get-image", async (req, res) => {
  try {
    await Images.find({}).then(data => {
      res.send({ status: "ok", data: data })
    })

  } catch (error) {

  }
})*/
