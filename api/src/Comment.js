const {
    queryCommentFromDB,
    updateCommentToDB,
    addCommentToDB, deleteCommentFromDB,
} = require("./MongoDBConnector");

const getComment = async (req, res) => {
    let username = req.username;
    let commentID = req.params.id;
    queryCommentFromDB(res, username, commentID);
}

const putComment = async (req, res) => {
    let commentID = req.params.id;
    let username = req.username;
    let text = req.body.text;
    let articleID = req.body.articleID;
    await updateCommentToDB(res, commentID, {
        username: username,
        text: text,
        timestamp: new Date().getTime(),
        parent_article_id: articleID,
    });
}

const postComment = async (req, res) => {
    let username = req.username;
    let text = req.body.text;
    let articleID = req.body.articleID;
    await addCommentToDB(res, {
        username: username,
        text: text,
        timestamp: new Date().getTime(),
        parent_article_id: articleID,
    });
}

const deleteComment = async (req, res) => {
    let username = req.username;
    let commentID = req.params.id;
    await deleteCommentFromDB(res, username, commentID);
}

module.exports = (app) => {
    app.get("/api/comment/:id", getComment);
    app.put("/api/comment/:id", putComment);
    app.post("/api/comment", postComment);
    app.delete("/api/comment/:id", deleteComment);
}