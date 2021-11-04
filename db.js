const spicedPg = require("spiced-pg");

const dbUsername = "postgres";
const dbUserPassword = "postgres";
const database = "petition";

const db = spicedPg(`postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`);

console.log("[db] Connecting to ", database);

module.exports.getSigners = () => {
    const q = "SELECT * FROM signatures";
    return db.query(q);
};

module.exports.addSigner = (first, last, signature) => {
    const q = `INSERT INTO signatures (first,last,signature) VALUES($1,$2,$3)`;
    const params = [first, last, signature];
    return db.query(q, params);
};
