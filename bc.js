const bcrypt = require("bcryptjs");
// const {hash, compare, genSalt, } = require("bcryptjs");

exports.hash = password => {
    return bcrypt.genSalt().then(salt => {
        console.log(salt);
        console.log(password);
        return bcrypt.hash(password, salt);
    });
};

exports.compare = bcrypt.compare;
