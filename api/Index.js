const express = require("express");
const Auth = require("./src/Auth");
const Article = require("./src/Article");
const Profile = require("./src/Profile");
const Following = require("./src/Following");
const Comment = require("./src/Comment");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const upCloud = require("./src/UploadCloudinary");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/api/hello", (req, res) => {
    res.send("hello!");
});

app.use(express.static(path.join(__dirname, '../frontend/build')))
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/build/index.html'))
})

Auth(app);
Article(app);
Profile(app);
Following(app);
Comment(app);
upCloud.setup(app);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    const add = server.address();
    console.log(`Server listening at https://${add.address}:${add.port}`)
});
