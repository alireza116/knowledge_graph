const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
// const moment = require("moment");
var cookieParser = require("cookie-parser");
var bodyparser = require("body-parser");
const fs = require("fs");
const csv = require("csvtojson");

console.log(__dirname);

// let rawdata = fs.readFileSync(
//   path.join(__dirname, "public/dataset_combined_3_23_2021.geojson"),
//   {
//     encoding: "utf-8",
//   }
// );
// console.log(rawdata);

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
// API calls
app.post("/api/data", (req, res) => {
  // res.json(geojson);
  if (req.files === null) {
    console.log("no req files");
    return res.status(400).json({ msg: "no file uploaded" });
  }
  if (!req.files.file.name.endsWith(".csv")) {
    console.log("not csv");
    return res.status(400).json({ msg: "wrong file uploaded" });
  }
  console.log(req.files);
  // console.log(req.protocol + "://" + req.get("host"));
  // console.log(req.file);
  let f = req.files.file.data.toString("utf8");
  // console.log(f);
  // let path = "public/dataset_2.csv";
  // console.log(req.files.file.path);
  csv()
    .fromString(f)
    .then((jsonObj) => {
      // console.log(jsonObj);
      res.json(jsonObj);
      /**
       * [
       * 	{a:"1", b:"2", c:"3"},
       * 	{a:"4", b:"5". c:"6"}
       * ]
       */
    });
});

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));

  // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

app.listen(port, () => console.log(`Listening on port ${port}`));
