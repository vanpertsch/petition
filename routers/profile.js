const express = require("express");
const { requireLoggedIn } = require("../middleware/authorization.js");

const { hash, compare } = require("../bc.js");
const db = require("../db.js");

const router = express.Router();



router.get("/profile", requireLoggedIn, (req, res) => {
    res.render("profile", {
    });

});

router.get("/profile-edit", requireLoggedIn, (req, res) => {
    const user_id = req.session.userId;
    db.getUserProfile(user_id)
        .then(({ rows }) => {
            console.log("getProfileXXX", rows);
            res.render("profile-edit", {
                userProfile: rows
            });
        }).catch(err => console.log("error in getUserProfile", err));
});





router.post("/profile-edit", (req, res) => {

    let { first, last, email, age, city, url, password } = req.body;

    const user_id = req.session.userId;

    const citySanatize = city.toLowerCase().charAt(0).toUpperCase() + city.slice(1);

    if (url && !url.startsWith("http")) {
        url = "http://" + url;
        console.log("changed");
    }


    let userUpdatePromise;

    if (password) {
        // 1. Hash the password
        userUpdatePromise = hash(password).then(hashedPW => {
            return db.updateUserWithPassword(first, last, email, hashedPW, user_id);
        }).catch(error => console.log("error in updatuserwothpassword", error));
    } else {
        // db.updateUser(userId, firstName, lastName, email)
        // Save the resulting promise to userUpdatePromise
        userUpdatePromise = db.updateUser(first, last, email, user_id).then(() => {
            return console.log("yay insertet", req.session);
        }).catch(err => console.log("error in updateUser", err));
    }

    Promise.all([
        userUpdatePromise,
        db.upsertProfile(age, citySanatize, url, user_id)
    ])
        .then(() => {
            res.redirect("/thanks");
            return console.log("yay insertet after promise all", req.session);
        }).catch(err => console.log("error in updatechain", err));


});

router.post("/profile", (req, res) => {

    let { age, city, url } = req.body;

    const user_id = req.session.userId;
    const citySanatize = city.toLowerCase().charAt(0).toUpperCase() + city.slice(1);

    if (url && !url.startsWith("http")) {
        url = "http://" + url;
        console.log("changed");
    }

    db.addProfile(user_id, age, citySanatize, url)
        .then(() => {
            console.log("yay insertet", req.session);
            res.redirect("/petition");
        }).catch((err) => {
            console.log("err in addSigner", err);
            res.render("profile", {
                error: "Please try again"
            });
        });
});

module.exports.profileRouter = router;


