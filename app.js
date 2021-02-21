const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");

require("./models/profile");
require("./models/user");
require("./models/yetki");
require("./models/ilan");
require("./models/category");
require("./models/product");

const userRoute = require("./routes/users");
const profileRoute = require("./routes/profiles");
const storeRoute = require("./routes/stores");
const ilanRoute = require("./routes/ilanlar");
const productRoute = require("./routes/products");
const adminRoute = require("./routes/admin");

mongoose
  .connect(
    "mongodb+srv://bugracelenk:1234qwerasdf@32alsat-backend-zacht.mongodb.net/test?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )//bağlantı yapıyo
  .then(() => console.log("Connected to MongoDB"))//bağlandığını bildiriyo
  .catch(err => console.log(err));//hataları ekrana basıyo
mongoose.Promise = global.Promise;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan("dev"));

app.use((req, res, next) => { //CORS İzinleri
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/api/users", userRoute);
app.use("/api/profiles", profileRoute);
app.use("/api/stores", storeRoute);
app.use("/api/ilanlar", ilanRoute);
app.use("/api/products", productRoute);
app.use("/api/admin", adminRoute);

module.exports = app;