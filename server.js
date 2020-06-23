// include modules
const express = require("express");
const sql = require("sqlite3").verbose();
const FormData = require("form-data");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");

// DATABASE CREATION
const postCardDB = new sql.Database("postcard.db");

let cmd =
  " SELECT name FROM sqlite_master WHERE type='table' AND name='postcardTable' ";
postCardDB.get(cmd, function(err, val) {
  console.log(err, val);
  if (val == undefined) {
    console.log("No database file - creating one");
    createpostcardDB();
  } else {
    console.log("Database file found");
  }
});

function createpostcardDB() {
 
  const cmd =
    "CREATE TABLE postcardTable ( id TEXT PRIMARY KEY UNIQUE, message TEXT, color TEXT, font TEXT, image TEXT)";
  postCardDB.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure", err.message);
    } else {
      console.log("Created database");
    }
  });
}

let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + "/images");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
// let upload = multer({dest: __dirname+"/assets"});
let upload = multer({ storage: storage });

// begin constructing the server pipeline
const app = express();

// Serve static files out of public directory
app.use(express.static("public"));

// Also serve static files out of /images
app.use("/images", express.static("images"));

// Handle GET request to base URL with no other route specified
// by sending creator.html, the main page of the app
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/public/creator.html");
});

// Next, the the two POST AJAX queries

// Handle a post request to upload an image.
app.post("/upload", upload.single("newImage"), function(request, response) {
  console.log(
    "Recieved",
    request.file.originalname,
    request.file.size,
    "bytes"
  );
  if (request.file) {
    // file is automatically stored in /images,
    // even though we can't see it.
    // We set this up when configuring multer
    response.end("recieved " + request.file.originalname);
  } else throw "error";
});

app.use(bodyParser.json());

function querystring(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.post("/saveDisplay", function(req, res) {
  sendMediaStore(req, res);
});

app.get("/postcardData", (req, res) => {
  const id = req.query.id;
  let cmd = "SELECT * FROM postcardTable WHERE id = ?";
  postCardDB.get(cmd, id, function(err, row) {
    if (err) {
      console.log("Database reading error", err.message);
      // next();
    } else {
      console.log("row", row);
      res.json(row);
    }
  });
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

function sendMediaStore(req, res) {
  console.log(req.body);
  const id = querystring(22);
  const { message, font, color, image } = req.body;
  let filename = image.split("/")[image.split("/").length - 1];
  filename = "./images/" + filename;
  let apiKey = "1xpu3ck0q0";
  if (apiKey === undefined) {
    throw "No API KEY";
  } else {
    let form = new FormData();

    form.append("apiKey", apiKey);
    form.append("storeImage", fs.createReadStream(filename));
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(
      err,
      APIres
    ) {
      if (APIres) {
        console.log("API response status", APIres.statusCode);

        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {

          if (APIres.statusCode != 200) {

            console.log(" Media server says: " + body);
            throw "BAD REQUEST";
          } else {

            console.log(body);
            fs.unlinkSync(filename);
            cmd =
              "INSERT INTO postcardTable ( id, message, font, color, image) VALUES (?,?,?,?,?) ";
            const newPath = "http://ecs162.org:3000/images/" + body;
            postCardDB.run(cmd, id, message, font, color, newPath, function(
              err
            ) {
              if (err) {
                console.log("DB insert error", err.message);
              } else {
                res.send(id);
              }
            });
            return;
          }
        });
      } else {
        // didn't get APIres at all
        throw "INTERNAL SERVER ERROR";
      
      }
    });
  }
}
