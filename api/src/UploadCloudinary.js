const stream = require("stream")
const cloudinary = require("cloudinary")
const multer = require("multer");

if (!process.env.CLOUDINARY_URL) {
    console.error("You must set the CLOUDINARY_URL environment variable for Cloudinary to function\n");
    console.error("\texport CLOUDINARY_URL=\"cloudinary:// get value from heroku\"\n");
    process.exit(1);
}

const doUpload = (publicId, req, res, next) => {
    const uploadStream = cloudinary.uploader.upload_stream(result => {
        req.fileurl = result.url;
        req.fileid = result.public_id;
        next();
    }, { public_id: publicId});

    const s = new stream.PassThrough();
    s.end(req.file.buffer);
    s.pipe(uploadStream);
    s.on("end", uploadStream.end);
}

const uploadImage = (prefix) => (req, res, next) => {
    let publicId = "";
    if (prefix === "avatar") {
        publicId = prefix + "_" + req.username;
    } else {
        /*
            https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
        */
        let randomString = (Math.random() + 1).toString(36).substring(4);
        publicId = prefix + "_" + req.username + "_" + new Date().valueOf() + "_" + randomString;
    }
    multer().single(prefix)(req, res, () =>
        doUpload(publicId, req, res, next))
}

const postImage = (req, res) => {
    res.send({
        name: req.fileid,
        status: "done",
        url: req.fileurl,
        thumbUrl: req.fileurl,
    })
}

const setup = (app) => {
    app.post("/api/upload/image", uploadImage("image"), postImage);
    app.post("/api/upload/avatar", uploadImage("avatar"), postImage);
}

module.exports = { uploadImage, setup }
