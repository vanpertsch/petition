const supertest = require('supertest');
const { app } = require('../server');
const cookieSess = require('cookie-session');

test('GET /register works', () => {
    return supertest(app).get('/register').then(
        res => {
            expect(res.statusCode).toBe(200);
        }
    );
});
test('Users who are logged in are redirected to the petition page when they attempt to go to either the registration page or the login page', () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);

    return supertest(app).get('/login').then(
        res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith('/petition')).toBe(true);

        }
    );
});



test('Users who are logged in and have signed the petition are redirected to the thank you page when they attempt to go to the petition page or submit a signature', () => {
    const fakeSess = { userId: 2, signatureId: 1 };
    cookieSess.mockSessionOnce(fakeSess);

    return supertest(app).('/petition').then(
        res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith('/thanks')).toBe(true);

        }
    );
});

// jest.mock('./db');
// const db = require('./db');
// db.addSignature.mockResolvedValue({});
