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
let randomHeadline = (Math.random() + 1).toString(36).substring(7);
console.log("random headline", randomHeadline);

describe("Validate Profile Functionality", () => {
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

    it("change the headline", (done) => {
        fetch(url("/api/headline"), {
            method: "PUT",
            headers: {"Content-Type": "application/json", "cookie": cookie},
            body: JSON.stringify({
                headline: randomHeadline,
            }),
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual("test");
            expect(res.headline).toEqual(randomHeadline);
            done();
        })
    });

    it("get the headline of a specific user", (done) => {
        fetch(url("/api/headline/test"), {
            method: "GET",
            headers: {"Content-Type": "application/json", "cookie": cookie},
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual("test");
            expect(res.headline).toEqual(randomHeadline);
            done();
        });
    });

    it("get the headline of the user self", (done) => {
        fetch(url("/api/headline"), {
            method: "GET",
            headers: {"Content-Type": "application/json", "cookie": cookie},
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual("test");
            expect(res.headline).toEqual(randomHeadline);
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
});
