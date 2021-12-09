const {
    createGetOneAttributeByUsername,
    createPutOneAttributeByUsername,
    queryProfileByUsername,
    updateProfileByUsername
} = require("./MongoDBConnector");

const collectionKey = "user_profile";

const getEmail = createGetOneAttributeByUsername(collectionKey, "email");
const putEmail = createPutOneAttributeByUsername(collectionKey, "email");
const getDOB = createGetOneAttributeByUsername(collectionKey, "dob");
const getZipcode = createGetOneAttributeByUsername(collectionKey, "zipcode");
const putZipcode = createPutOneAttributeByUsername(collectionKey, "zipcode");
const getHeadline = createGetOneAttributeByUsername(collectionKey, "headline");
const putHeadline = createPutOneAttributeByUsername(collectionKey, "headline");
const getAvatar = createGetOneAttributeByUsername(collectionKey, "avatar");
const putAvatar = createPutOneAttributeByUsername(collectionKey, "avatar");
const getDisplayedName = createGetOneAttributeByUsername(collectionKey, "displayed_name");
const putDisplayedName = createPutOneAttributeByUsername(collectionKey, "displayed_name");
const getGoogleEmail = createGetOneAttributeByUsername(collectionKey, "google_email");

const getProfile = async (req, res) => {
    let username = req.params.user ? req.params.user : req.username;
    await queryProfileByUsername(res, username);
}

const putProfile = async (req, res) => {
    let username = req.username;
    await updateProfileByUsername(res, username, {
        displayed_name: req.body.displayed_name,
        phone: req.body.phone,
        email: req.body.email,
        zipcode: req.body.zipcode,
        headline: req.body.headline,
        dob: req.body.dob,
    });
}

module.exports = (app) => {
    app.get("/api/email/:user?",getEmail);
    app.put("/api/email", putEmail);
    app.get("/api/dob/:user?", getDOB);
    app.get("/api/zipcode/:user?", getZipcode);
    app.put("/api/zipcode", putZipcode);
    app.get("/api/headline/:user?", getHeadline);
    app.put("/api/headline", putHeadline);
    app.get("/api/avatar/:user?", getAvatar);
    app.put("/api/avatar", putAvatar);
    app.get("/api/displayed_name/:user?", getDisplayedName);
    app.put("/api/displayed_name", putDisplayedName);
    app.get("/api/google_email/:user?", getGoogleEmail);
    app.get("/api/profile/:user?", getProfile);
    app.put("/api/profile", putProfile);
}
