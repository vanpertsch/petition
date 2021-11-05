const express = require("express");
const app = express();
const db = require("./db.js");

const hb = require("express-handlebars");
const path = require("path");

const cookieSession = require('cookie-session');

const helmet = require('helmet')

app.use(helmet.frameguard());

app.engine("handlebars", hb());
app.set("view engine", "handlebars");


app.use(express.static(path.join(__dirname, '/public')));

app.use(express.urlencoded({
    extended: false
}));


app.use(cookieSession({
    secret: `Get a free cookie.`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true
}));

app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use((req, res, next) => {
    console.log(`${req.method}|${req.url}`);
    next();
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    console.log(req.session);
    if (req.session.sigId) {

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
    if (req.session.sigId) {
        Promise.all([
            db.getSignature(req.session.sigId),
            db.getSignersTotal()
        ]).
            then((data) => {
                let sign = data[0].rows[0];
                let signersTotal = data[1].rows[0];

                res.render("thanks", {
                    // layout: null,
                    sign: sign,
                    signersTotal: signersTotal
                });
            }).catch(err => console.log("err in getSignersTotal", err));

        // db.getSignersTotal().then(({ rows }) => {
        //     res.render("thanks", {
        //         // layout: null,
        //         sign: sign,
        //         signersTotal: rows
        //     });
        // }).catch(err => console.log("err in getSignersTotal", err));
    } else {
        res.redirect("/petition");
    }

});
app.get("/signers", (req, res) => {

    db.getSigners()
        .then(({ rows }) => {
            res.render("signers", {
                // layout: null,
                // cohort: "Poppy",
                signers: rows
            });
        }).catch(err => console.log("err in getSigners", err));

});

app.post("/petition", (req, res) => {

    const { first, last, hidden } = req.body;
    db.addSigner(first, last, hidden)
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;
            console.log("yay insertet", req.session);
            res.redirect("/thanks");
        }).catch(err => {
            console.log("err in addSigner", err);
        });

});


// add this logout route to delete your cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});



app.listen(8080, () => console.log("running on 8080"));
