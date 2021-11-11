const supertest = require('supertest');
const { app } = require('./server');
const cookieSess = require('cookie-session');


test('Users who are logged out are redirected to the registration page when they attempt to go to the petition page', () => {
    const fakeSess = {};
    cookieSess.mockSessionOnce(fakeSess);

    return supertest(app).get('/petition').then(
        res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith('/register')).toBe(true);

        }
    );
});



// jest.mock('./db');
// const db = require('./db');
// db.addSignature.mockResolvedValue({});
