require("es6-promise").polyfill();
require("isomorphic-fetch");

const url = path => `http://localhost:3000/${path}`;
let cookie;

const userProfile = {
    username: "DLeebron",
    password: "1234DLeebron",
    headline: "This is my headline!",
    phone: "2899912200",
    email: "foo@bar.com",
    zipcode: "12345",
    dob: "128999122000",
}

describe("Validate Registration And Login Functionality", () => {
    it("register new user", (done) => {
        fetch(url("/api/register"), {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(userProfile),
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual("DLeebron");
            expect(res.result).toEqual("success");
            done();
        });
    });

    it("login user", (done) => {
        fetch(url("/api/login"), {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: "DLeebron",
                password: "1234DLeebron",
            }),
        }).then(res => {
            cookie = res.headers.get("set-cookie");
            return res.json();
        }).then(res => {
            expect(res.username).toEqual("DLeebron");
            expect(res.result).toEqual("success");
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
