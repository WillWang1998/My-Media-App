const express = require("express");
const Auth = require("./src/Auth");
const Article = require("./src/Article");
const Profile = require("./src/Profile");
const Following = require("./src/Following");
const Comment = require("./src/Comment");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const upCloud = require("./src/UploadCloudinary");
const cors = require("cors");
const path = require("express");

const corsOption = {
    origin: ["https://comp531-rw48-mymedia-frontend.herokuapp.com"],
    credentials: true,
}

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOption));
app.set("trust proxy", 1);

app.get("/api/hello", (req, res) => {
    res.send("hello!");
});

Auth(app);
Article(app);
Profile(app);
Following(app);
Comment(app);
upCloud.setup(app);

app.use(express.static(path.join(__dirname, '../frontend/build')))
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../frontend/build/index.html'))
})

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
    const add = server.address();
    console.log(`Server listening at http://${add.address}:${add.port}`)
});
