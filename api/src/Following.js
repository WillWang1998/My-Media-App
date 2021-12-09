const {
    addFollowingToDB,
    deleteFollowingFromDB,
    queryFollowingFromDB, queryUnfollowedUsernameByUsernameAndSearchKeyFromDB,
} = require("./MongoDBConnector");

const getFollowing = async (req, res) => {
    let username = req.params.username ? req.params.username : req.username;
    await queryFollowingFromDB(res, username);
}

const putFollowing = async (req, res) => {
    let username = req.username;
    let usernameToAdd = req.params.user;
    await addFollowingToDB(res, username, usernameToAdd);
}

const deleteFollowing = async (req, res) => {
    let username = req.username;
    let usernameToDelete = req.params.user;
    if (username === usernameToDelete) {
        res.sendStatus(400);
    } else {
        await deleteFollowingFromDB(res, username, usernameToDelete);
    }
}

const postFollowingSearch = async (req, res) => {
    let username = req.username;
    let keyWord = req.body.keyWord;
    await queryUnfollowedUsernameByUsernameAndSearchKeyFromDB(res, username, keyWord);
}

module.exports = (app) => {
    app.get("/api/following/:user?", getFollowing);
    app.put("/api/following/:user", putFollowing);
    app.delete("/api/following/:user", deleteFollowing);
    app.post("/api/following/search", postFollowingSearch);
}