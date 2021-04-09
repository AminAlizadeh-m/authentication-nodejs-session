const express = require('express');
const session = require('express-session');

const app = express();

const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
    PORT = 1717,
    NODE_ENV = 'development',

    SESS_LIFETIME = TWO_HOURS,
    SESS_SECRET = '@min@lizadeh!!1234567,seven\'secretKey',
    SESS_NAME = 'sid',
} = process.env;

const IN_PROD = process.env.NODE_ENV === 'production';

app.use(session({
    name: SESS_NAME,
    // Resave : Forces the session to be saved back to the session store, even if the session was never modified during the request.
    resave: false,
    // Rolling : Reset maxAge every response send
    rolling: false,
    // SaveUnitialized : Forces a session that is "uninitialized" to be saved to the store. A session is uninitialized when it is new but not modified.
    saveUninitialized: false,
    // Secret : This is the secret used to sign the session ID cookie.
    secret: SESS_SECRET,
    // Store : The session store instance, defaults to a new MemoryStore instance.
    //TODO : Set an store
    /* UnSet: Control the result of unsetting req.session (through delete, setting to null, etc.).
       'destroy' The session will be destroyed (deleted) when the response ends.
       'keep' The session in the store will be kept, but modifications made during the request are ignored and not saved.
    */
   unset: 'keep',
    cookie: {
        // HTTPOnly : Cookies cannot be read with JS on the client-side
        httpOnly: true,
        // MaxAge : By default, no maximum age is set when you close browser session will be deleted.
        maxAge: SESS_LIFETIME,
        // Path : Can only be used on a given site & route
        path: '/',
        // SameSite : Can only be sent from the same domain, i.e. no CORS sharing
        sameSite: true,
        // Secure : Can only sent over encrypted HTTPS channel
        secure: IN_PROD
    }
}));

app.get('/', (req, res) => {
    res.send('Welcome to my app!!');
});

app.listen(PORT, () => console.log(
    `http://localhost:${PORT}`
));