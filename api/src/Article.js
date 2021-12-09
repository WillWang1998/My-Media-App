const {
    updateArticleToDB,
    addCommentToDB,
    updateCommentToDB,
    queryArticleByIDFromDB,
    queryArticlesByUsernameFromDB,
    addArticleToDB,
    queryFollowingArticlesByUsernameFromDB,
    updateArticleTextToDB,
    queryFollowingArticleIdsByUsernameAndSearchKeyFromDB,
    queryFollowingArticleIdsByUsernameFromDB,
    deleteArticleFromDB
} = require("./MongoDBConnector");

const getArticles = async (req, res) => {
    if (req.params.id) {
        let l = req.params.id.split("=");
        if (l.length < 2) {
            res.sendStatus(400);
        } else if (l[0] === "articleID") {
            let articleID = l[1];
            queryArticleByIDFromDB(res, articleID);
        } else {
            let username = l[1];
            queryArticlesByUsernameFromDB(res, username);
        }
    } else {
        let username = req.username;
        await queryFollowingArticlesByUsernameFromDB(res, username);
    }
}

const putArticles = async (req, res) => {
    let commentID = req.body.commentID;
    let articleID = req.params.id;
    let username = req.username;
    let text = req.body.text;
    if (commentID) {
        if (commentID === -1) {
            await addCommentToDB(res, {
                username: username,
                text: text,
                timestamp: new Date().getTime(),
                parent_article_id: articleID,
            });
        } else {
            await updateCommentToDB(res, commentID, {
                username: username,
                text: text,
                timestamp: new Date().getTime(),
                parent_article_id: articleID,
            });
        }
    } else {
        updateArticleTextToDB(res, articleID, username, text);
    }
}

const postArticle = async (req, res) => {
    let username = req.username;
    await addArticleToDB(res, {
        title: req.body.title,
        text: req.body.text,
        username: username,
        timestamp: new Date().getTime(),
        images: req.body.images,
        comments: [],
    });
}

const postSearchArticle = async (req, res) => {
    let username = req.username;

    if (!req.body || !req.body.keyWord) {
        await queryFollowingArticleIdsByUsernameFromDB(res, username);
    } else {
        let keyWord = req.body.keyWord;
        await queryFollowingArticleIdsByUsernameAndSearchKeyFromDB(res, {
            username: username,
            keyWord: keyWord,
        });
    }
}

const getArticle = async (req, res) => {
    let articleID = req.params.id;
    let username = req.username;
    await queryArticleByIDFromDB(res, username, articleID);
}

const putArticle = async (req, res) => {
    let articleID = req.params.id;
    let username = req.username;
    let text = req.body.text;
    let title = req.body.title;
    let images = req.body.images;
    await updateArticleToDB(res, articleID, username, {
        title: title,
        text: text,
        images: images,
        timestamp: new Date().getTime(),
    });
}

const deleteArticle = async (req, res) => {
    let username = req.username;
    let articleID = req.params.id;
    await deleteArticleFromDB(res, username, articleID);
}

module.exports = (app) => {
    // just follow the instruction, not used in the project...
    app.get("/api/articles/:id?", getArticles);
    app.put("/api/articles/:id", putArticles);

    app.post("/api/search/article", postSearchArticle);
    app.get("/api/article/:id", getArticle);
    app.put("/api/article/:id", putArticle);  //TODO: Only return status or not
    app.delete("/api/article/:id", deleteArticle);
    app.post("/api/article", postArticle);
}
