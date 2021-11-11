const spicedPg = require("spiced-pg");

const dbUsername = "postgres";
const dbUserPassword = "postgres";
const database = "petition";

const db = spicedPg(process.env.DATABASE_URL || `postgres:${dbUsername}:${dbUserPassword}@localhost:5432/${database}`);

console.log("[db] Connecting to ", database);


// ----------------------Adding------------------------------------------------
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
module.exports.addProfile = (user_id, age, city, url) => {
    const q = `INSERT INTO profiles (user_id, age,city,url) VALUES($1,$2,$3,$4) RETURNING id`;
    const params = [user_id, age || null, city, url];
    return db.query(q, params);
};

// ---------------------UPDATES----------------------------------------------

module.exports.updateUser = (first, last, email, id) => {
    const q = `UPDATE users SET first = $1, last=$2, email=$3  WHERE users.id = $4`;
    const params = [first, last, email, id];
    return db.query(q, params);
};
module.exports.updateUserWithPassword = (first, last, email, password, id) => {
    const q = `UPDATE users SET first = $1, last=$2, email=$3, password=$4  WHERE users.id = $5`;
    const params = [first, last, email, password, id];
    return db.query(q, params);
};

module.exports.upsertProfile = (age, city, url, id) => {
    const q = `INSERT INTO profiles (age,city,url,user_id) VALUES($1,$2,$3,$4) ON CONFLICT (user_id) DO UPDATE SET age=$1, city=$2, url=$3 WHERE profiles.user_id=$4`;
    const params = [age || null, city, url, id];
    return db.query(q, params);
};

// ---------------------DELETE------------------------------------------------


module.exports.deleteSignature = (id) => {
    const q = `DELETE FROM signatures WHERE signatures.id = ${id}`;
    return db.query(q);
};


// ---------------------Check------------------------------------------------
module.exports.checkEmail = (email) => {
    const q = `SELECT * FROM users WHERE email = $1`;
    const params = [email];
    return db.query(q, params);
};

module.exports.checkIfHasSigned = (user_id) => {
    const q = `SELECT signature,id FROM signatures WHERE user_id =${user_id}`;
    return db.query(q);
};



// ---------------------GET--------------------------------------------------
module.exports.getPassword = (email) => {
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

module.exports.getSignersWithJoin = () => {
    const q = `SELECT * FROM users JOIN profiles ON users.id = profiles.user_id JOIN signatures ON users.id = signatures.user_id`;
    return db.query(q);
};
module.exports.getSignersInCity = (city) => {
    const q = `SELECT * FROM users JOIN profiles ON users.id = profiles.user_id JOIN signatures ON users.id = signatures.user_id WHERE city = $1`;
    const params = [city];
    return db.query(q, params);
};
module.exports.getUserProfile = (id) => {
    const q = `SELECT first,last,email,city,age,url FROM users LEFT JOIN profiles ON users.id = profiles.user_id WHERE users.id = $1`;
    const params = [id];
    return db.query(q, params);
};

module.exports.getSignature = (num) => {
    const q = `SELECT signature FROM signatures WHERE id = ${num}`;
    return db.query(q);
};

module.exports.getSignersTotal = () => {
    const q = "SELECT count(*) FROM signatures";
    return db.query(q);
};
