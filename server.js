const express = require("express");
const bodyParser = require("body-parser");
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

// API calls
app.get("/api/data", (req, res) => {
  // res.json(geojson);
  csv()
    .fromFile("public/dataset.csv")
    .then((jsonObj) => {
      console.log(jsonObj);
      res.json(jsonObj);
      /**
       * [
       * 	{a:"1", b:"2", c:"3"},
       * 	{a:"4", b:"5". c:"6"}
       * ]
       */
    });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
