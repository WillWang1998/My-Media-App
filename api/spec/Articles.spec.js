require("es6-promise").polyfill();
require("isomorphic-fetch");

const url = path => `http://localhost:3000/${path}`;
let cookie;
/*
    There is an existed user in the database.
 */

/*
    https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
*/
let randomString = (Math.random() + 1).toString(36).substring(7);
console.log("random string", randomString);

describe("Validate Article Functionality", () => {
    it("login user", (done) => {
        fetch(url("/api/login"), {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: "test",
                password: "test",
            }),
        }).then(res => {
            cookie = res.headers.get("set-cookie");
            return res.json();
        }).then(res => {
            expect(res.username).toEqual("test");
            expect(res.result).toEqual("success");
            done();
        });
    });

    it("get the specific article", (done) => {
        fetch(url("/api/articles/articleID=6198607413270e291d86a155"), {
            method: "GET",
            headers: {"Content-Type": "application/json", "cookie": cookie},
        }).then(res => res.json()).then(res => {
            expect(res._id).toEqual("6198607413270e291d86a155");
            done();
        })
    });

    it("get the articles of a specific user", (done) => {
        fetch(url("/api/articles/username=test"), {
            method: "GET",
            headers: {"Content-Type": "application/json", "cookie": cookie},
        }).then(res => res.json()).then(res => {
            expect(res.length).toEqual(2);
            for (let _res of res) {
                expect(_res.username).toEqual("test");
            }
            done();
        });
    });

    it("get the articles related to the user", (done) => {
        fetch(url("/api/articles"), {
            method: "GET",
            headers: {"Content-Type": "application/json", "cookie": cookie},
        }).then(res => res.json()).then(res => {
            expect(res.length).toEqual(2);
            for (let _res of res) {
                expect(_res.username).toEqual("test");
            }
            done();
        });
    });

    it("logout user", (done) => {
        fetch(url("/api/logout"), {
            method: "PUT",
            headers: {"Content-Type": "text/html", "cookie": cookie},
        }).then(res => {
            expect(res.ok).toBeTruthy();
            done();
        })
    });

    it("login user", (done) => {
        fetch(url("/api/login"), {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: "test1",
                password: "test1",
            }),
        }).then(res => {
            cookie = res.headers.get("set-cookie");
            return res.json();
        }).then(res => {
            expect(res.username).toEqual("test1");
            expect(res.result).toEqual("success");
            done();
        });
    });

    it("post a new article", (done) => {
        fetch(url("/api/article"), {
            method: "POST",
            headers: {"Content-Type": "application/json", "cookie": cookie},
            body: JSON.stringify({
                title: randomString,
                text: randomString
            }),
        }).then(res => res.json()).then(res => {
            expect(res.title).toEqual(randomString);
            done();
        });
    });

    it("can comment under an article", (done) => {
        fetch(url("/api/articles/6198678db78a2e5e5364d533"), {
            method: "PUT",
            headers: {"Content-Type": "application/json", "cookie": cookie},
            body: JSON.stringify({
                commentID: -1,
                text: randomString
            }),
        }).then(res => res.json()).then(res => {
            let commentID = res.comments[res.comments.length - 1];
            fetch(url("/api/comments/" + commentID), {
                method: "GET",
                headers: {"Content-Type": "application/json", "cookie": cookie}
            }).then(res => res.json()).then(res => {
                expect(res.text).toEqual(randomString);
            })
            done();
        });
    });

    it("can edit a comment with same username", (done) => {
        fetch(url("/api/articles/6198678db78a2e5e5364d533"), {
            method: "PUT",
            headers: {"Content-Type": "application/json", "cookie": cookie},
            body: JSON.stringify({
                commentID: "61987936cf2d365e43d24147",
                text: randomString
            }),
        }).then(res => res.json()).then(res => {
            fetch(url("/api/comments/61987936cf2d365e43d24147"), {
                method: "GET",
                headers: {"Content-Type": "application/json", "cookie": cookie},
            }).then(res => res.json()).then(res => {
                expect(res.text).toEqual(randomString);
            })
            done();
        });
    });

    it("cannot edit a comment with different username", (done) => {
        fetch(url("/api/articles/619866846c97ee36c1c41f76"), {
            method: "PUT",
            headers: {"Content-Type": "application/json", "cookie": cookie},
            body: JSON.stringify({
                commentID: "61986ca30e0d9dfd7fb8f878",
                text: randomString
            }),
        }).then(res => {
            expect(res.ok).not.toBeTruthy();
            done();
        });
    });

    it("can edit articles with same username", (done) => {
        fetch(url("/api/articles/6198678db78a2e5e5364d533"), {
            method: "PUT",
            headers: {"Content-Type": "application/json", "cookie": cookie},
            body: JSON.stringify({
                text: randomString
            }),
        }).then(res => res.json()).then(res => {
            expect(res.text).toEqual(randomString);
            done();
        });
    });

    it("cannot edit articles with different username", (done) => {
        fetch(url("/api/articles/6198607413270e291d86a155"), {
            method: "PUT",
            headers: {"Content-Type": "application/json", "cookie": cookie},
            body: JSON.stringify({
                text: randomString
            }),
        }).then(res => {
            expect(res.ok).not.toBeTruthy();
            done();
        });
    })

    it("logout user", (done) => {
        fetch(url("/api/logout"), {
            method: "PUT",
            headers: {"Content-Type": "text/html", "cookie": cookie},
        }).then(res => {
            expect(res.ok).toBeTruthy();
            done();
        });
    });
});
