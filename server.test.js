const supertest = require('supertest');
const { app } = require('./server');
const cookieSess = require('cookie-session');
jest.mock('./db');
const db = require('./db');


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

test("When the input is good, the user is redirected to the thank you page", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    db.addSignature.mockResolvedValue({
        rows: [
            { id: 9 }
        ],

    });

    return supertest(app).post('/petition').then(
        res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location.endsWith('/thanks')).toBe(true);
        }
    );
});



test("When the input is bad, the response body contains an error message", () => {
    const fakeSess = { userId: 2 };
    cookieSess.mockSessionOnce(fakeSess);
    db.addSignature.mockResolvedValue({
        rows: [{}],
    });

    return supertest(app).post('/petition').then(
        res => {
            expect(res.text).toContain('Please try again');
        }
    );
});



