const md5 = require("md5");
const redis = require("redis");
const {
    addUser,
    updateUserLoginInfo,
    queryUserLoginInfoAndSaveSid,
    queryGoogleIdUsernameAndSaveSidOrRegister,
    addGoogleLinking,
    deleteGoogleLinkingFromDB
} = require("./MongoDBConnector");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const redisClient = redis.createClient("redis://:p6edd08766ce76cd4ca4dd50ba15c2598cce9b5bedfd5d7d47d6f05d459095ebf@ec2-3-216-109-138.compute-1.amazonaws.com:30519");
console.log("The connection with redis is established.");

const isLoggedIn = async (req, res, next) => {
    if (!req.cookies || !req.cookies.sid) {
        res.clearCookie("sid");
        res.clearCookie("isLoggedIn");
        res.sendStatus(401);
    } else {
        let sid = req.cookies.sid;
        redisClient.hget("sessions", sid, (err, username) => {
            if (err) {
                console.error("["+new Date().toLocaleString()+"]: ", err);
                res.clearCookie("sid");
                res.clearCookie("isLoggedIn");
                res.sendStatus(500);
            } else if (username) {
                req.username = username;
                console.log("debug username", username);
                res.cookie("isLoggedIn", true, {maxAge: 3600 * 1000});
                next();
            } else {
                res.clearCookie("sid");
                res.clearCookie("isLoggedIn");
                res.sendStatus(401);
            }
        });
    }
}

const postLogin = async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        return res.sendStatus(400);
    }

    await queryUserLoginInfoAndSaveSid(res, redisClient, {
        username: username,
        password: password,
    });
}

const googleInfoMW = async (req, res, next) => {
    if (!req.cookies || !req.cookies.googleToken) {
        res.clearCookie("usernameForGoogle");
        res.clearCookie("displayedNameForGoogle");
        res.clearCookie("emailForGoogle");
        res.clearCookie("googleToken");
        next();
    } else {
        let googleToken = req.cookies.googleToken;
        redisClient.getdel("google_token#" + googleToken, (err, reply) => {
            if (err) {
                console.error("[" + new Date().toLocaleString() + "]: ", err);
                res.sendStatus(500);
            } else if (reply) {
                res.clearCookie("usernameForGoogle");
                res.clearCookie("displayedNameForGoogle");
                res.clearCookie("emailForGoogle");
                res.clearCookie("googleToken");
                let idAndEmailList = reply.split("#");
                let id = idAndEmailList[0];
                let email = idAndEmailList[1];
                res.google_id = id;
                res.google_email = email;
                next();
            } else {
                res.sendStatus(400);
            }
        })
    }
}

const postRegister = async (req, res) => {
    let salt = req.body.username + new Date().getTime();
    let hash = md5(salt + req.body.password);

    let userProfile = {
        username: req.body.username,
        phone: req.body.phone,
        email: req.body.email,
        zipcode: req.body.zipcode,
        displayed_name: req.body.displayedName,
        headline: "",
        dob: req.body.dob,
        avatar: "https://joeschmoe.io/api/v1/" + req.body.username,
        followings: [req.body.username],
        articles: [],
        google_id: res.google_id,
        google_email: res.google_email,
    };
    let userLoginInfo = {
        username: req.body.username,
        salt: salt,
        hash: hash,
    }
    await addUser(res, userProfile, userLoginInfo, redisClient);
}

const putLogout = (req, res) => {
    let sid = req.cookies.sid;
    if (sid) {
        redisClient.hdel("sessions", sid);
        res.clearCookie("sid");
        res.send("OK");
    } else {
        res.sendStatus(400);
    }
}

const putPassword = async (req, res) => {
    let username = req.username;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    if (!username || !oldPassword || !newPassword) {
        return res.sendStatus(400);
    }

    let salt = username + new Date().getTime();
    let hash = md5(salt + newPassword);

    let userLoginInfo = {
        username: username,
        salt: salt,
        hash: hash,
    }
    await updateUserLoginInfo(res, oldPassword, userLoginInfo);
}

const sessionForGoogle = session({
    secret: "19260817",
    resave: true,
    saveUninitialized: true
});

const googleStrategy = new GoogleStrategy({
    clientID: "716278758743-1mleeq670bb54mospmtpsls19pqv76i2.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback"
}, function(accessToken, refreshToken, profile, done) {
    let user = {
        accessToken: accessToken,
        googleId: profile.id,
        profile: {
            username: "google" + profile.id + accessToken.slice(-3),
            displayedName: profile.displayName,
            avatar: profile.photos[0].value,
            email: profile.emails[0].value,
        },
    };
    return done(null, user);
});

const deleteGoogleLinking = async (req, res) => {
    let username = res.username;
    console.log("debug username", username);
    await deleteGoogleLinkingFromDB(res, username);
}

module.exports = (app) => {
    app.post("/api/login", postLogin);
    app.post("/api/register", googleInfoMW, postRegister);
    app.use(sessionForGoogle);
    app.use(passport.initialize(undefined));
    app.use(passport.session(undefined));
    passport.use(googleStrategy);
    app.get("/auth/google", //  TODO: Frontend link to here
        passport.authenticate("google",{
            scope: ["profile", "email"],
        })
    );

    app.get("/auth/google/callback", (req, res) => {
        passport.authenticate("google", async (err, user, info) => {
            if (!req.cookies || !req.cookies.sid) { // login
                if (err) {
                    console.error("["+new Date().toLocaleString()+"]: ", err);
                    // TODO:
                    //  The passport calls this function before getting the user's profile.
                    //  After sending the cookie and redirect firstly but then get the user's profile,
                    //  the server will still send the response, causing the server's crash.
                    // res.cookie("backendMessage", "error#Google login failed!", {
                    //     maxAge: 10000,
                    // });
                    // res.redirect("https://comp531-rw48-mymedia.herokuapp.com/landing");
                } else {
                    req.user = user;
                    await queryGoogleIdUsernameAndSaveSidOrRegister(res, redisClient, req);
                }
            } else { // binding
                let sid = req.cookies.sid;
                redisClient.hget("sessions", sid, async (err, username) => {
                    if (err) {
                        console.error("["+new Date().toLocaleString()+"]: ", err);
                        res.cookie("backendMessage", "error#Internal Server Error", {
                            maxAge: 10000,
                            sameSite: 'none',
                            secure: true,
                            
                        });
                        res.redirect("https://comp531-rw48-mymedia.herokuapp.com/profile");
                    } else if (username) {
                        req.username = username;
                        req.user = user;
                        await addGoogleLinking(res, req);
                    } else {
                        res.cookie("backendMessage", "error#You need to login", {
                            maxAge: 10000,
                            sameSite: 'none',
                            secure: true,
                        });
                        res.clearCookie("sid");
                        res.redirect("https://comp531-rw48-mymedia.herokuapp.com/landing");
                    }
                });
            }
        })(req, res);
    });
    app.use(isLoggedIn);
    app.put("/api/logout", putLogout);
    app.put("/api/password", putPassword);
    app.delete("/api/unlink_google_account", deleteGoogleLinking);
}
