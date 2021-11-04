const express = require("express");
const app = express();
const db = require("./db.js");

const hb = require("express-handlebars");
const path = require("path");

const cookieParser = require("cookie-parser");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");


app.use(express.static(path.join(__dirname, '/public')));

app.use(express.urlencoded({
    extended: false
}));

app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`${req.method}|${req.url}`);
    next();
});

app.get("/petition", (req, res) => {
    // console.log("cookies", req.cookies.SignedPetition);
    if (req.cookies.SignedPetition) {

        res.redirect("/thanks");
    } else {
        res.render("petition", {
            // layout: null,
            // cohort: "Poppy",
            // projects
        });
    }


});
app.get("/thanks", (req, res) => {
    res.render("thanks", {
        // layout: null,
        // cohort: "Poppy",
        // projects
    });
});
app.get("/signers", (req, res) => {

    db.getSigners()
        .then(({ rows }) => {
            res.render("signers", {
                // layout: null,
                // cohort: "Poppy",
                signers: rows
            });
        }).catch(err => console.log(err));

});

app.post("/petition", (req, res) => {

    const { first, last, hidden } = req.body;

    db.addSigner(first, last, "forTesting")
        .then(() => {
            console.log("yay insertet");
        }).catch(err => {
            console.log("err in addSigner", err);
        });

    res.cookie("SignedPetition", "true");
    res.redirect("/thanks");
});


// app.get("/", (req, res) => {
//     db.getActors()
//         .then(({ rows }) => {
//             console.log("getActors", rows);
//         }).catch(err => console.log(err));
// });

// app.post("/add-actors", (req, res) => {
//     db.addActor("Janelle Monae", 36)
//         .then(() => {
//             console.log("yay insertet");
//         }).catch(err => console.log("err in addActor", err));
// });

app.listen(8080, () => console.log("running on 8080"));
