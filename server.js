const express = require("express");
const app = express();
const db = require("./db.js");

const { hash, compare } = require("./bc.js");

const hb = require("express-handlebars");
const path = require("path");

const cookieSession = require('cookie-session');

const helmet = require('helmet');

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

app.use(helmet.frameguard());

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

// ---------------------------------End Middleware-------------------------


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


app.post("/login", (req, res) => {

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
                            //check if he has signed petition and redirect
                            db.checkIfHasSigned(rows[0].id).then(({ rows }) => {
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
                })
        }
    }).catch((err) => {
        console.log("err in login", err);
        return res.render("login", {
            error: "Please enter valid email and password"
        });
    });
});

app.get("/login", (req, res) => {
    res.render("login", {
    });

});

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
        });
    }

});

app.post("/petition", (req, res) => {

    const user_id = req.session.userId;
    //get value of hidden field. which is set to image from signature
    const { hidden } = req.body;

    db.addSignature(user_id, hidden)
        .then(({ rows }) => {
            //set sessioncookie for the signature
            req.session.signatureId = rows[0].id;
            res.redirect("/thanks");
        }).catch(err => {
            console.log("err in addSigner", err);
        });
});


app.get("/thanks", (req, res) => {
    // check for signatureId in cookie
    console.log("req.session in thanks", req.session);
    if (req.session.signatureId) {
        Promise.all([
            db.getSignature(req.session.signatureId),
            db.getSignersTotal()
        ]).
            then((data) => {
                let sign = data[0].rows[0];
                let signersTotal = data[1].rows[0];

                res.render("thanks", {
                    sign: sign,
                    signersTotal: signersTotal
                });
            }).catch(err => console.log("err in getSignersTotal", err));

    } else {
        res.redirect("/petition");
    }

});

app.get("/signers", (req, res) => {

    db.getSignersWithJoin().then(({ rows }) => {
        return res.render("signers", {
            signers: rows
        });
    }).catch(err => console.log("err in getSignersWithJoin", err));

});
app.get("/signers/city/:city", (req, res) => {
    const cityFromUrl = req.params.city.toLowerCase();

    db.getSignersInCity(cityFromUrl).then(({ rows }) => {
        console.log("getSignersInCity", rows);
        return res.render("signers", {
            cityFromUrl: cityFromUrl,
            signers: rows
        });

    }).catch(err => console.log("err in getSignersInCity", err));

});


app.get("/profile", (req, res) => {
    res.render("profile", {
    });

});
app.get("/profile-edit", (req, res) => {
    const user_id = req.session.userId;
    db.getUserProfile(user_id)
        .then(({ rows }) => {
            console.log("getProfileXXX", rows);
            res.render("profile-edit", {
                userProfile: rows
            });
        }).catch(err => console.log("error in getUserProfile", err));
});





app.post("/profile-edit", (req, res) => {

    let { first, last, email, age, city, url } = req.body;

    const user_id = req.session.userId;

    const cityInLowerCases = city.toLowerCase();

    if (url && !url.startsWith("http")) {
        url = "http://" + url;
        console.log("changed");
    }

    db.updateUser(first, last, email, user_id).then(() => {
        console.log("yay insertet", req.session);
        res.redirect("/petition");
    }).catch(err => console.log("error in updateUser", err));

});

app.post("/profile", (req, res) => {

    let { age, city, url } = req.body;

    const user_id = req.session.userId;
    const cityInLowerCases = city.toLowerCase();
    if (url && !url.startsWith("http")) {
        url = "http://" + url;
        console.log("changed");
    }

    db.addProfile(user_id, age, cityInLowerCases, url)
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


// logout route to delete your cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.listen(process.env.PORT || 8080, () => console.log("running on 8080"));
