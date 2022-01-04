const express = require("express");
const { requireSigned, requireLoggedIn } = require("../middleware/authorization.js");

const db = require("../db.js");

const router = express.Router();

router.get("/thanks", requireLoggedIn, requireSigned, (req, res) => {

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


});

router.post("/signature/delete", requireLoggedIn, requireSigned, (req, res) => {
    const signatureId = req.session.signatureId;
    db.deleteSignature(signatureId).then(() => {
        req.session.signatureId = null;
        res.redirect("/petition");
    }).catch(err => console.log("err in deleteSignature", err));;

});

module.exports.signedRouter = router;


