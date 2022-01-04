const express = require("express");
const { requireNotLoggedIn } = require("../middleware/authorization.js");

const { hash, compare } = require("../bc.js");
const db = require("../db.js");

const router = express.Router();


router.get("/register", requireNotLoggedIn, (req, res) => {
    res.render("register");
});

router.post("/register", requireNotLoggedIn, (req, res) => {
    const { first, last, email, password } = req.body;

    hash(password)
        .then(hashedPW => {
            return db.addUser(first, last, email, hashedPW);
        })
        .then(({ rows }) => {
            req.session.userId = rows[0].id;
            console.log("yay insertet", req.session);
            res.redirect("/profile");
        }).catch((err) => {
            console.log("err in addSigner", err);
            res.render("profile", {
                error: "Please try again"
            });
        });
});

router.get("/login", requireNotLoggedIn, (req, res) => {
    res.render("login", {
    });
});

router.post("/login", requireNotLoggedIn, (req, res) => {
    const { email, password } = req.body;

    db.checkEmail(email).then(result => {
        if (result == undefined) {
            return res.render("login", {
                error: "Please enter valid email and password"
            });
        } else {
            return db.getPassword(email)
                .then(({ rows }) => {
                    return compare(password, rows[0].password);
                }).then(result => {
                    //if user is already registered:
                    if (result) {
                        return db.getUserId(email).then(({ rows }) => {
                            //Set Session Cookie
                            req.session.userId = rows[0].id;
                            //check if has signed petition and redirect
                            db.checkIfHasSigned(rows[0].id).then(({ rows }) => {
                                console.log(rows);
                                if (rows[0] == undefined) {
                                    return res.redirect("/petition");

                                } else {
                                    console.log("rows", rows);
                                    req.session.signatureId = rows[0].id;
                                    console.log("req.session in login", req.session);
                                    return res.redirect("/thanks");
                                }
                            });

                        });
                        // if user enters wrong password / is not registered
                    } else {
                        return res.render("login", {
                            error: "Please enter valid email and password"
                        });
                    }
                });
        }
    }).catch((err) => {
        console.log("err in login", err);
        return res.render("login", {
            error: "Please enter valid email and password"
        });
    });
});


// logout route to delete your cookies
router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

module.exports.authRouter = router;


