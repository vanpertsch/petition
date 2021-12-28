const express = require("express");

//export for testing
const app = exports.app = express();

const db = require("./db.js");

const { hash, compare } = require("./bc.js");

const hb = require("express-handlebars");
const path = require("path");

const cookieSession = require('cookie-session');

const helmet = require('helmet');
const { requireLoggedIn, requireNotSigned } = require("./middleware/authorization.js");
const { authRouter } = require("./routers/auth-router.js");
const { profileRouter } = require("./routers/profile.js");
const { signedRouter } = require("./routers/signed.js");
const { signersRouter } = require("./routers/signers.js");


app.engine("handlebars", hb());
app.set("view engine", "handlebars");


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
app.use(express.urlencoded({
    extended: false
}));

const COOKIE_SECRET = process.env.COOKIE_SECRET || require("./.secrets.json").COOKIE_SECRET;

//Enables session cookies
app.use(cookieSession({
    secret: COOKIE_SECRET,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    // Security protect against Cross- site request forgeries(CSRF):
    sameSite: true
}));

//Security protects against clickjacking/ website being loaded as an iframe
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});


//Get information about the routes while developing
app.use((req, res, next) => {
    console.log(`${req.method}|${req.url}`);
    next();
});


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
            res.redirect("/thanks");
        }).catch(err => {
            console.log("err in addSigner", err);
        });
});






if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => console.log("running on 8080"));
}
