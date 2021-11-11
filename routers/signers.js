const express = require("express");
const { requireLoggedIn, requireSigned } = require("../middleware/authorization.js");

const { hash, compare } = require("../bc.js");
const db = require("../db.js");

const router = express.Router();


router.get("/signers", requireLoggedIn, requireSigned, (req, res) => {

    db.getSignersWithJoin().then(({ rows }) => {
        return res.render("signers", {
            signers: rows
        });
    }).catch(err => console.log("err in getSignersWithJoin", err));

});

router.get("/signers/city/:city", requireLoggedIn, requireSigned, (req, res) => {
    const cityFromUrl = req.params.city.toLowerCase().charAt(0).toUpperCase() + req.params.city.slice(1);


    db.getSignersInCity(cityFromUrl)
        .then(({ rows }) => {
            return res.render("signers", {
                cityFromUrl: cityFromUrl,
                signers: rows
            });

        }).catch(err => console.log("err in getSignersInCity", err));

});


module.exports.signersRouter = router;


