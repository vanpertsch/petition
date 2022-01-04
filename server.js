const express = require("express");
<<<<<<< HEAD
const app = express();
const db = require("./db.js");

=======

//export for testing
const app = exports.app = express();

const db = require("./db.js");

const { hash, compare } = require("./bc.js");

>>>>>>> e9c1709146da9672484586dacb99cf10f7a48c10
const hb = require("express-handlebars");
const path = require("path");

const cookieSession = require('cookie-session');

<<<<<<< HEAD
const helmet = require('helmet')

app.use(helmet.frameguard());
=======
const helmet = require('helmet');
const { requireLoggedIn, requireNotSigned } = require("./middleware/authorization.js");
const { authRouter } = require("./routers/auth-router.js");
const { profileRouter } = require("./routers/profile.js");
const { signedRouter } = require("./routers/signed.js");
const { signersRouter } = require("./routers/signers.js");

>>>>>>> e9c1709146da9672484586dacb99cf10f7a48c10

app.engine("handlebars", hb());
app.set("view engine", "handlebars");


<<<<<<< HEAD
app.use(express.static(path.join(__dirname, '/public')));

=======
if (process.env.NODE_ENV == 'production') {
    app.use((req, res, next) => {
        if (req.headers['x-forwarded-proto'].startsWith('https')) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

// ---------------------------------Start Middleware-------------------------

// app.use(helmet.frameguard());
app.use(helmet());

app.use(express.static(path.join(__dirname, '/public')));

//Makes the body elements from the post request readble
>>>>>>> e9c1709146da9672484586dacb99cf10f7a48c10
app.use(express.urlencoded({
    extended: false
}));

<<<<<<< HEAD

app.use(cookieSession({
    secret: `Get a free cookie.`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true
}));

=======
const COOKIE_SECRET = process.env.COOKIE_SECRET || require("./.secrets.json").COOKIE_SECRET;

//Enables session cookies
app.use(cookieSession({
    secret: COOKIE_SECRET,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    // Security protect against Cross- site request forgeries(CSRF):
    sameSite: true
}));

//Security protects against clickjacking/ website being loaded as an iframe
>>>>>>> e9c1709146da9672484586dacb99cf10f7a48c10
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

<<<<<<< HEAD
=======

//Get information about the routes while developing
>>>>>>> e9c1709146da9672484586dacb99cf10f7a48c10
app.use((req, res, next) => {
    console.log(`${req.method}|${req.url}`);
    next();
});

<<<<<<< HEAD
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
=======

app.use(authRouter);
app.use(signedRouter);
app.use(profileRouter);
app.use(signersRouter);
// ---------------------------------End Middleware-------------------------


app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/petition", requireLoggedIn, requireNotSigned, (req, res) => {

    res.render("petition", {

    });

});

app.post("/petition", requireLoggedIn, requireNotSigned, (req, res) => {

    const user_id = req.session.userId;
    //get value of hidden field. which is set to image from signature
    const { hidden } = req.body;

    db.addSignature(user_id, hidden)
        .then(({ rows }) => {
            console.log(rows);

            if (rows[0].id == undefined || rows[0].id == "") {
                return res.render("petition", {
                    error: "Please try again"
                });
            }
            //set sessioncookie for the signature
            req.session.signatureId = rows[0].id;
>>>>>>> e9c1709146da9672484586dacb99cf10f7a48c10
            res.redirect("/thanks");
        }).catch(err => {
            console.log("err in addSigner", err);
        });
<<<<<<< HEAD

});


// add this logout route to delete your cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});



app.listen(8080, () => console.log("running on 8080"));
=======
});






if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => console.log("running on 8080"));
}
>>>>>>> e9c1709146da9672484586dacb99cf10f7a48c10
