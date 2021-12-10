const mongoose = require("mongoose");
const is_email = require("is_email");
const md5 = require("md5");

// TODO: 1. Refactor to reduce the duplicated code
//       2. Redis transaction

const mongoDBConnectionString = "mongodb+srv://rw48:l1mDnhSQBrNR8jYc@comp531.lxyvy.mongodb.net/comp531_rw48_mymedia?retryWrites=true&w=majority";
mongoose.connect(mongoDBConnectionString, {
    keepAlive: true
}, ()=> {
    console.log("The connection with MongoDB is established.");
});

if (!process.env.CLOUDINARY_URL) {
    console.error("You must set the CLOUDINARY_URL environment variable for Cloudinary to function\n");
    process.exit(1)
}

const UserProfileSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required."],
        match: /^[a-zA-Z][a-zA-Z0-9]*$/,
    },
    phone: {
        type: String,
        required: [true, "Phone is required."],
        match: /^[0-9]{10}$/,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        validate: is_email.is_email, //Please check "https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression" for details.
    },
    zipcode: {
        type: String,
        required: [true, "Zipcode is required."],
        match: /^[0-9]{5}$/,
    },
    displayed_name: {
        type: String,
        required: [true, "Displayed name is required."],
        match: /^[a-zA-Z][a-zA-Z0-9]*$/,
    },
    headline: {
        type: String,
    },
    dob: {
        type: Date,
        required: [true, "DOB is required."],
    },
    avatar: {
        type: String,
        required: [true, "Avatar is required."],
    },
    followings: {
        type: [String],
        required: [true, "Following is required."],
    },
    articles: {
        type: [mongoose.Types.ObjectId],
        required: [true, "Articles are required."],
    },
    google_email: {
        type: String,
        validate: is_email.is_email, //Please check "https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression" for details.
    },
    google_id: {
        type: String,
    }
}, {
    collection: "user_profile",
    bufferCommands: false,
});

const CommentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required in comment."],
    },
    text: {
        type: String,
        required: [true, "text is required in comment."],
    },
    timestamp: {
        type: Date,
        required: [true, "Timestamp is required in comment"],
    },
    parent_article_id: {
        type: mongoose.Types.ObjectId,
        required: [true, "Parent_article_id is required in comment"]
    }
}, {
    collection: "comment",
    bufferCommands: false,
});

const ArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required."],
    },
    text: {
        type: String,
        required: [true, "text is required."],
    },
    username: {
        type: String,
        required: [true, "Username is required."],
    },
    timestamp: {
        type: Date,
        required: [true, "Timestamp is required"],
    },
    images: {
        type: [String],
        required: [true, "Images are required."],
    },
    comments: {
        type: [mongoose.Types.ObjectId],
        required: [true, "Comments are required."],
    }
}, {
    collection: "article",
    bufferCommands: false,
});

const UserLoginInfoSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required."],
    },
    salt: {
        type: String,
        required: [true, "Salt is required."],
    },
    hash: {
        type: String,
        required: [true, "Hash is required."],
    }
}, {
    collection: "user_login_info",
    bufferCommands: false,
});

const GoogleIdUsernameSchema = new mongoose.Schema({
    google_id: {
        type: String,
        required: [true, "Google id is required."],
    },
    username: {
        type: String,
        required: [true, "Username is required"],
    }
}, {
    collection: "google_id_username",
});


const UserProfile = mongoose.model("user_profile", UserProfileSchema);
const UserLoginInfo = mongoose.model("user_login_info", UserLoginInfoSchema);
const Comment = mongoose.model("comment", CommentSchema);
const Article = mongoose.model("article", ArticleSchema);
const GoogleIdUsername = mongoose.model("google_id_username", GoogleIdUsernameSchema);
const collectionNameToModel = {
    user_profile: UserProfile,
    user_login_info: UserLoginInfo,
    comment: Comment,
    article: Article,
    google_id_username: GoogleIdUsername
};


const createGetOneAttributeByUsername = (collectionKey, functionKey) => {
    return async (req, res) => {
        let username = req.params.user ? req.params.user : req.username;
        let model = collectionNameToModel[collectionKey];
        model.findOne({
            username: username,
        }, functionKey, (err, doc) => {
            if (err) {
                throw err;
            } else if (!doc) {
                res.sendStatus(404);
            } else {
                res.send({
                    username: username,
                    [functionKey]: doc[functionKey],
                });
            }
        });
    };
}

const createPutOneAttributeByUsername = (collectionKey, functionKey) => {
    return async (req, res) => {
        let username = req.username;
        let model = collectionNameToModel[collectionKey];
        let value = req.body[functionKey];
        model.findOneAndUpdate({
            username: username,
        }, {
            [functionKey]: value,
        }, {
            returnDocument: "after",
        }, (err, doc) => {
            if (err) {
                throw err;
            } else if (!doc) {
                res.sendStatus(404);
            } else {
                res.send({
                    username: username,
                    [functionKey]: doc[functionKey],
                });
            }
        });
    };
}

const queryProfileByUsername = (res, username) => {
    UserProfile.findOne({
        username: username,
    }, "username " +
        "displayed_name " +
        "phone " +
        "email " +
        "zipcode " +
        "headline " +
        "dob " +
        "avatar ", (err, doc) => {
        if (err) {
            throw err;
        } else if (!doc) {
            res.sendStatus(404);
        } else {
            res.send({
                username: doc.username,
                displayedName: doc.displayed_name,
                phone: doc.phone,
                email: doc.email,
                zipcode: doc.zipcode,
                headline: doc.headline,
                dob: doc.dob,
                avatar: doc.avatar,
            });
        }
    })
}

const updateProfileByUsername = (res, username, profile) => {
    UserProfile.findOneAndUpdate({
        username: username,
    }, {
        displayed_name: profile.displayed_name,
        phone: profile.phone,
        email: profile.email,
        zipcode: profile.zipcode,
        headline: profile.headline,
        dob: profile.dob,
    }, {
        returnDocument: "after",
    }, (err, doc) => {
        if (err) {
            throw err;
        } else if (!doc) {
            res.sendStatus(400);
        } else {
            res.send(doc);
        }
    })
}

const addUser = async (res, userProfile, userLoginInfo, redisClient, googleId) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let doc = await UserProfile.findOne({
                username: userProfile.username,
            }, {}, {session: session}).catch(err => {
                throw err;
            });
            if (doc) {
                res.status(400).send("This user has been registered!");
                await session.abortTransaction();
            } else {
                if (userProfile.google_id) {
                    await new GoogleIdUsername({
                        google_id: userProfile.google_id,
                        username: userProfile.username
                    }).save({session: session}).catch(err => {
                        throw err;
                    })
                }
                await new UserProfile(userProfile).save({session: session}).catch(err => {
                    throw err;
                });
                await new UserLoginInfo(userLoginInfo).save({session: session}).catch(err => {
                    throw err;
                });
                let sid = md5(new Date().getTime() + Math.random() * 1000000000000);
                await redisClient.hset("sessions", sid, userLoginInfo.username);
                res.cookie("isLoggedIn", true, {maxAge: 3600 * 1000});
                res.cookie("sid", sid, {maxAge: 3600 * 1000, httpOnly: true});
                let msg = {username: userLoginInfo.username, result: "success"};
                res.send(msg);
            }
        });
    } catch (err) {
        console.error("[" + new Date().toLocaleString() + "]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}

const queryUserLoginInfoAndSaveSid = async (res, redisClient, userLoginInfo) => {
    UserLoginInfo.findOne({
        username: userLoginInfo.username,
    }, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(400);
        } else {
            let hash = md5(doc.salt + userLoginInfo.password);
            if (hash === doc.hash) {
                let sid = md5(new Date().getTime() + Math.random() * 1000000000000);
                redisClient.hset("sessions", sid, userLoginInfo.username, (err) => {
                    if (err) {
                        console.error("["+new Date().toLocaleString()+"]: ", err);
                        res.sendStatus(500);
                    } else {
                        res.cookie("isLoggedIn", true, {maxAge: 3600 * 1000});
                        res.cookie("sid", sid, { maxAge: 3600 * 1000, httpOnly: true});
                        let msg = {username: userLoginInfo.username, result: "success"};
                        res.send(msg);
                    }
                });
            } else {
                res.status(401);
                res.send("Wrong Password!");
            }
        }
    });
}

const queryGoogleIdUsernameAndSaveSidOrRegister = async (res, redisClient, req) => {
    let googleUserLoginInfo = req.user;
    GoogleIdUsername.findOne({
        google_id: googleUserLoginInfo.googleId,
    }, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            const cookieSettings = {
                maxAge: 600 * 1000,
            }
            res.cookie("usernameForGoogle", googleUserLoginInfo.profile.username, cookieSettings);
            res.cookie("displayedNameForGoogle", googleUserLoginInfo.profile.displayedName, cookieSettings);
            res.cookie("emailForGoogle", googleUserLoginInfo.profile.email, cookieSettings);
            res.cookie("googleToken", googleUserLoginInfo.accessToken, {
                maxAge: 600 * 1000,
                httpOnly: true,
            });
            let googleTokenForRedis = "google_token#" + googleUserLoginInfo.accessToken;
            redisClient.SET(googleTokenForRedis,
                googleUserLoginInfo.googleId + "#" + googleUserLoginInfo.profile.email, (err) => {
                if (err) {
                    console.error("["+new Date().toLocaleString()+"]: ", err);
                    res.sendStatus(500);
                } else {
                    redisClient.EXPIRE(googleTokenForRedis, 600, (err) => {
                        if (err) {
                            console.error("["+new Date().toLocaleString()+"]: ", err);
                            res.sendStatus(500);
                        } else {
                            res.cookie("backendMessage", "warning#You need to link an account for the first time.", {
                                maxAge: 10000,
                            });
                            res.redirect("https://comp531-rw48-mymedia.herokuapp.com/register_with_google");
                        }
                    })
                }
            });
        } else {
            let sid = md5(new Date().getTime() + Math.random() * 1000000000000);
            redisClient.HSET("sessions", sid, doc.username, (err) => {
                if (err) {
                    console.error("["+new Date().toLocaleString()+"]: ", err);
                    res.cookie("backendMessage", "error#Internal Server Error.", {
                        maxAge: 10000,
                    });
                    res.redirect("https://comp531-rw48-mymedia.herokuapp.com/landing");
                } else {
                    res.cookie("sid", sid, { maxAge: 3600 * 1000, httpOnly: true});
                    res.cookie("isLoggedIn", true, {maxAge: 3600 * 1000});
                    res.redirect("https://comp531-rw48-mymedia.herokuapp.com/home");
                }
            });
        }
    });
}

const updateUserLoginInfo = async (res, oldPassWord, userLoginInfo) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let doc = await UserLoginInfo.findOne({
                username: userLoginInfo.username,
            }, {}, {session: session}).catch(err => {throw err;});
            if (!doc) {
                res.status(400);
                await session.abortTransaction();
            } else {
                let hash = md5(doc.salt + oldPassWord);
                if (hash === doc.hash) {
                    let doc = await UserLoginInfo.findOneAndUpdate({
                        username: userLoginInfo.username,
                    }, {
                        salt: userLoginInfo.salt,
                        hash: userLoginInfo.hash,
                    }, {session: session}).catch(err => {throw err;});
                    res.send({
                        username: doc.username,
                        result: "success",
                    });
                } else {
                    res.sendStatus(401);
                }
            }
        });
    } catch (err) {
        console.error("["+new Date().toLocaleString()+"]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}

const addGoogleLinking = async (res, req) => {
    const googleLinkingInfo = req.user;
    const username = req.username;
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            await GoogleIdUsername.findOneAndDelete({
                username: username,
            }, {session: session}).catch(err => {throw err;});
            await new GoogleIdUsername({
                google_id: googleLinkingInfo.googleId,
                username: username,
            }).save({session: session,}).catch(err => {throw err;});
            await UserProfile.findOneAndUpdate({
                username: username,
            }, {
                google_id: googleLinkingInfo.googleId,
                google_email: googleLinkingInfo.profile.email,
            }, {session: session}).catch(err => {throw err;});
            res.redirect("https://comp531-rw48-mymedia.herokuapp.com/profile");
        });
    } catch (err) {
        console.error("[" + new Date().toLocaleString() + "]: ", err);
        res.cookie("backendMessage", "error#Internal Server Error", {
            maxAge: 10000,
        });
        res.sendStatus(500);
    }
}

const deleteGoogleLinkingFromDB = async (res, username) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let googleIdUsername = await GoogleIdUsername.findOneAndDelete({
                username: username
            }, {session: session}).catch(err => {throw err;});
            if (!googleIdUsername) {
                res.sendStatus(404);
            } else {
                let doc = await UserProfile.findOneAndUpdate({
                    username: username
                }, {
                    google_id: null,
                    google_email: null,
                },{
                    session: session
                }).catch(err => {throw err;});
                if (!doc || !doc.google_id) {
                    res.sendStatus(404);
                } else {
                    res.sendStatus(200);
                }
            }
        })
    } catch (err) {
        console.error("["+new Date().toLocaleString()+"]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}


const queryFollowingFromDB = async (res, username) => {
    UserProfile.findOne({
        username: username,
    }, "followings", {}, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(400);
        } else {
            let followings = doc.followings;
            let index = followings.indexOf(username);
            if (index > -1) {
                followings.splice(index, 1);
            }
            res.send({
                username: username,
                followings: followings,
            });
        }
    });
}


const addFollowingToDB = async (res, username, usernameToAdd) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let doc = await UserProfile.findOne({
                username: usernameToAdd
            }, {}, {
                session: session,
            }).catch(err => {throw err;});
            if (!doc) {
                res.sendStatus(400);
                await session.abortTransaction();
            } else {
                let doc = await UserProfile.findOneAndUpdate({
                    username: username
                }, {
                    $push: {followings: usernameToAdd}
                }, {
                    returnDocument: "after",
                    session: session,
                }).catch(err => {throw err;});
                let followings = doc.followings;
                let index = followings.indexOf(username);
                if (index > -1) {
                    followings.splice(index, 1);
                }
                res.send({
                    username: username,
                    followings: followings,
                });
            }
        });
    } catch (err) {
        console.error("["+new Date().toLocaleString()+"]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}

const deleteFollowingFromDB = async (res, username, usernameToDelete) => {
    UserProfile.findOneAndUpdate({
        username: username
    }, {
        $pull: {followings: usernameToDelete}
    }, {
        returnDocument: "after",
    }, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(404);
        } else {
            let followings = doc.followings;
            let index = followings.indexOf(username);
            if (index > -1) {
                followings.splice(index, 1);
            }
            res.send({
                username: username,
                followings: followings,
            });
        }
    });
}

const queryUnfollowedUsernameByUsernameAndSearchKeyFromDB = async (res, username, keyWord) => {
    UserProfile.findOne({
        username: username,
    }, "followings", {}, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(400);
        } else {
            UserProfile.find({
                $and: [
                    {
                        $or: [
                            {
                                username: {$regex: keyWord}
                            },
                            {
                                displayed_name: {$regex: keyWord}
                            }
                        ]
                    }, {
                        username: {$nin: doc.followings},
                    }
                ]
            }, "username", {}, (err, doc) => {
                if (err) {
                    console.error("["+new Date().toLocaleString()+"]: ", err);
                    res.sendStatus(500);
                } else {
                    let searchResult = [];
                    doc.forEach(item => searchResult.push(item.username));
                    res.send({
                        username: username,
                        searchResult: searchResult,
                    })
                }
            });
        }
    });
}


const addArticleToDB = async (res, article) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let doc = new Article(article);
            await doc.save({
                session: session,
            }).catch(err => {throw err;});
            await UserProfile.findOneAndUpdate({
                username: article.username,
            }, {
                $push: {
                    articles: doc._id,
                }
            }, {
                session: session
            }).catch(err => {throw err;});
            res.send(doc);
        });
    } catch (err) {
        console.error("["+new Date().toLocaleString()+"]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}

const updateArticleToDB = async (res, articleId, username, article) => {
    Article.findOneAndUpdate({
        _id: articleId,
        username: username
    }, {
        title: article.title,
        text: article.text,
        images: article.images,
        timestamp: article.timestamp
    }, {
        returnDocument: "after",
    }, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(404);
        } else {
            res.send({
                title: article.title,
                text: article.text,
                timestamp: article.timestamp,
                images: article.images,
            });
        }
    })
}

const updateArticleTextToDB = (res, articleId, username, text) => {
    Article.findOneAndUpdate({
        _id: articleId,
        username: username
    }, {
        text: text,
    }, {
        returnDocument: "after",
    }, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(404);
        } else {
            res.send(doc);
        }
    })
}


const queryFollowingArticlesByUsernameFromDB = async (res, username) => {
    UserProfile.findOne({
        username: username
    }, "followings", (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else {
            Article.find({
                username: {
                    $in: doc.followings,
                },
            }, (err, doc) => {
                if (err) {
                    console.error("["+new Date().toLocaleString()+"]: ", err);
                    res.sendStatus(500);
                } else {
                    res.send(doc);
                }
            });
        }
    });
}

const queryArticlesByUsernameFromDB = (res, username) => {
    Article.find({
        username: username
    }, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else {
            res.send(doc);
        }
    });
}

const queryArticleByIDFromDB = (res, username, id) => {
    Article.findById(id, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(404);
        } else {
            res.send({
                username: username,
                id: doc._id,
                author: doc.username,
                title: doc.title,
                text: doc.text,
                timestamp: doc.timestamp,
                imageUrlList: doc.images,
                commentIdList: doc.comments,
            });
        }
    });
}

const queryFollowingArticleIdsByUsernameAndSearchKeyFromDB = async (res, searchParams) => {
    let username = searchParams.username;
    let keyWord = searchParams.keyWord;
    UserProfile.findOne({
        username: username
    }, "followings", (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else {
            let followings = doc.followings;
            let followingsWithSearchKeyInDisplayedName = [];
            UserProfile.find({
                $and: [
                    {
                        username: {
                            $in: followings,
                        }
                    }, {
                        displayed_name: {
                            $regex: keyWord,
                        }
                    }
                ]
            }, "username", (err, doc) => {
                if (err) {
                    console.error("["+new Date().toLocaleString()+"]: ", err);
                    res.sendStatus(500);
                } else {
                    followingsWithSearchKeyInDisplayedName = doc;
                    Article.find({
                        $and: [
                            {
                                username: {
                                    $in: followings,
                                }
                            }, {
                                $or: [
                                    {
                                        username: {$regex : keyWord},
                                    }, {
                                        title: {$regex: keyWord},
                                    }, {
                                        text: {$regex: keyWord},
                                    }, {
                                        username: {$in: followingsWithSearchKeyInDisplayedName},
                                    }
                                ]
                            }
                        ]
                    }, "_id timestamp",(err, doc) => {
                        if (err) {
                            console.error("["+new Date().toLocaleString()+"]: ", err);
                            res.sendStatus(500);
                        } else {
                            doc.sort((itemA, itemB) => {
                                return itemB.timestamp - itemA.timestamp;
                            });
                            let ids = [];
                            doc.forEach(item => ids.push(item._id));
                            res.send({
                                username: username,
                                ids: ids,
                            });
                        }
                    });
                }
            });
        }
    });
}

const queryFollowingArticleIdsByUsernameFromDB = async (res, username) => {
    UserProfile.findOne({
        username: username
    }, "followings", (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else {
            let followings = doc.followings;
            Article.find({
                username: {$in: followings,},
            }, "_id timestamp",(err, doc) => {
                if (err) {
                    console.error("["+new Date().toLocaleString()+"]: ", err);
                    res.sendStatus(500);
                } else {
                    doc.sort((itemA, itemB) => {
                        return itemB.timestamp - itemA.timestamp;
                    });
                    let ids = [];
                    doc.forEach(item => ids.push(item._id));
                    res.send({
                        username: username,
                        ids: ids,
                    });
                }
            });
        }
    });
}

const deleteArticleFromDB = async (res, username, articleID) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let doc = await Article.findOneAndDelete({
                _id: articleID,
                username: username,
            }, {session: session}).catch(err => {throw err;});
            if (!doc) {
                res.sendStatus(400);
                await session.abortTransaction();
            } else {
                await UserProfile.findOneAndUpdate({
                    username: username,
                }, {
                    $pull: {
                        articles: articleID,
                    }
                }, {
                    session: session,
                    returnDocument: "after",
                }).catch(err => {throw err;});
                await Comment.deleteMany({
                    _id: {$in: doc.comments}
                }, {session: session}).catch(err => {throw err;});
                res.send({
                    username: username,
                    result: "success",
                });
            }
        })
    } catch (err) {
        console.error("["+new Date().toLocaleString()+"]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}

const addCommentToDB = async (res, comment) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let doc = new Comment(comment);
            await doc.save({session: session}).catch(err => {throw err;});
            doc = await Article.findByIdAndUpdate(doc.parent_article_id, {
                $push: {
                    comments: doc._id,
                },
            }, {
                returnDocument: "after",
                session: session,
            }).catch(err => {throw err;});
            if (doc) {
                res.send(doc);
            } else if (!doc) {
                res.sendStatus(404);
            }
        });
    } catch (err) {
        console.error("["+new Date().toLocaleString()+"]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}

const updateCommentToDB = async (res, commentID, comment) => {
    Comment.findOneAndUpdate({
        _id: commentID,
        username: comment.username,
    }, {
        text: comment.text,
        timestamp: comment.timestamp,
    }, {
        returnDocument: "after",
    }, (err, doc) =>{
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(404);
        } else {
            res.send(doc);
        }
    });
}

const queryCommentFromDB = (res, username, commentID) => {
    Comment.findById(commentID, (err, doc) => {
        if (err) {
            console.error("["+new Date().toLocaleString()+"]: ", err);
            res.sendStatus(500);
        } else if (!doc) {
            res.sendStatus(404);
        } else {
            res.send({
                username: username,
                id: doc._id,
                author: doc.username,
                text: doc.text,
                timestamp: doc.timestamp,
                parent_article_id: doc.parent_article_id,
            });
        }
    });
}

const deleteCommentFromDB = async (res, username, commentId) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            let doc = await Comment.findOneAndDelete({
                _id: commentId,
                username: username,
            }).catch(err => {throw err;});
            if (!doc) {
                res.sendStatus(404);
                await session.abortTransaction();
            } else {

                await Article.findByIdAndUpdate(doc.parent_article_id, {
                    $pull: {
                        comments: doc._id,
                    },
                }, {
                    returnDocument: "after",
                    session: session,
                }).catch(err => {
                    throw err;
                });
                if (doc) {
                    res.send(doc);
                } else if (!doc) {
                    res.sendStatus(404);
                    await session.abortTransaction();
                }
            }
        });
    } catch (err) {
        console.error("["+new Date().toLocaleString()+"]: ", err);
        res.sendStatus(500);
    } finally {
        await session.endSession();
    }
}

module.exports = {
    // Profile.js
    createGetOneAttributeByUsername,
    createPutOneAttributeByUsername,
    queryProfileByUsername,
    updateProfileByUsername,

    // Auth.js
    updateUserLoginInfo,
    queryUserLoginInfoAndSaveSid,
    addUser,
    queryGoogleIdUsernameAndSaveSidOrRegister,
    addGoogleLinking,
    deleteGoogleLinkingFromDB,

    // Article.js
    queryArticleByIDFromDB,
    queryArticlesByUsernameFromDB,
    updateArticleToDB,
    updateArticleTextToDB,
    queryFollowingArticlesByUsernameFromDB,
    queryFollowingArticleIdsByUsernameFromDB,
    queryFollowingArticleIdsByUsernameAndSearchKeyFromDB,
    addArticleToDB,
    deleteArticleFromDB,

    // Article.js and Comment.js
    updateCommentToDB,
    addCommentToDB,
    queryCommentFromDB,
    deleteCommentFromDB,

    // Following.js
    queryFollowingFromDB,
    addFollowingToDB,
    deleteFollowingFromDB,
    queryUnfollowedUsernameByUsernameAndSearchKeyFromDB,
}
