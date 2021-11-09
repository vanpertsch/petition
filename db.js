const spicedPg = require("spiced-pg");

const dbUsername = "postgres";
const dbUserPassword = "postgres";
const database = "petition";

const db = spicedPg(`postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`);

console.log("[db] Connecting to ", database);



module.exports.addUser = (first, last, email, password) => {
    const q = `INSERT INTO users (first,last,email,password) VALUES($1,$2,$3,$4) RETURNING id`;
    const params = [first, last, email, password];
    return db.query(q, params);
};
module.exports.addSignature = (user_id, signature) => {
    const q = `INSERT INTO signatures (user_id, signature) VALUES($1,$2) RETURNING id`;
    const params = [user_id, signature];
    return db.query(q, params);
};

module.exports.checkEmail = (email) => {
    const q = `SELECT * FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.checkPassword = (email) => {
    const q = `SELECT password  FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.getUserId = (email) => {
    const q = `SELECT id  FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.getSignersIds = () => {
    const q = "SELECT user_id FROM signatures";
    return db.query(q);
};
module.exports.getSigners = (ids) => {
    const q = `SELECT * FROM users WHERE id = ANY(ARRAY[${ids}])`;
    return db.query(q);
};

module.exports.getSignature = (num) => {
    const q = `SELECT signature FROM signatures WHERE id = ${num}`;
    return db.query(q);
};

module.exports.getSignersTotal = () => {
    const q = "SELECT count(*) FROM signatures";
    return db.query(q);
};
