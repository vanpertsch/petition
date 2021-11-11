const supertest = require('supertest');
const { app } = require('../server');
const cookieSess = require('cookie-session');

test('Users who are logged in and have not signed the petition are redirected to the petition page when they attempt to go to either the thank you page or the signers page', () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);

    return supertest(app).get('/thanks').then(
        res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith('/petition')).toBe(true);

        }
    );
});




// jest.mock('./db');
// const db = require('./db');
// db.addSignature.mockResolvedValue({});
