const express = require("express");
const app = express();
const db = require("./db.js");
const { hash, compare } = require("./bc.js");

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
    res.redirect("/register");
});



app.get("/register", (req, res) => {
    res.render("register");
});


app.post("/register", (req, res) => {

    const { first, last, email, password } = req.body;

    hash(password)
        .then(hashedPW => {
            return db.addSigner(first, last, email, hashedPW,);
        })
        .then(({ rows }) => {
            req.session.sigId = rows[0].id;
            console.log("yay insertet", req.session);
            res.redirect("/petition");
        }).catch(err => {
            console.log("err in addSigner", err);
        });
});



app.get("/petition", (req, res) => {
    res.render("petition", {
    });
});

app.post("/petition", (req, res) => {

    const user_id = req.session.sigId;

    console.log(req.body);
    const { hidden } = req.body;

    db.addSignature(user_id, hidden)
        .then(({ rows }) => {
            req.session.signatureId = rows[0].id;
            console.log("yay insertet", req.session);
            res.redirect("/thanks");
        }).catch(err => {
            console.log("err in addSigner", err);
        });

});


app.get("/thanks", (req, res) => {
    if (req.session.signatureId) {
        Promise.all([
            db.getSignature(req.session.signatureId),
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



app.get("/login", (req, res) => {
    res.render("login", {
    });

});


app.post("/login", (req, res) => {

    const { email, password } = req.body;
    console.log("login emlai", email);

    db.checkEmail(email).then(result => {
        // console.log(result);
        if (result.rows == []) {
            throw new Error("Whoops!");
        } else {
            return db.checkPassword(email);
        }
    }).then(({ rows }) => {
        return compare(password, rows[0].password);
    }).then(result => {
        if (result) {
            return db.getUserId(email);

        } else {
            throw new Error("Whoops 222!");
        }
    }).then(({ rows }) => {
        req.session.sigId = rows[0].id;
        res.redirect("/petition");
    })
        .catch(err => {
            console.log("err in check", err);
        });


});


// add this logout route to delete your cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

//



app.listen(8080, () => console.log("running on 8080"));
