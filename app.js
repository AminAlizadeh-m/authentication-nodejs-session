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

// My storage (DB)
const users = [
    { id: 1, name: 'Amin', email: 'amin@gmail.com', password: '123' },
    { id: 2, name: 'Foad', email: 'foad@gmail.com', password: '123' },
    { id: 3, name: 'Iman', email: 'iman@gmail.com', password: '123' }
];

app.use(express.urlencoded({
    extended: true
}));

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

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login');
    } else {
        next();
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/home');
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    const { userId } = req.session;
    console.log(userId);
    res.send(`
        <h1>Welcome to my app</h1>
        ${userId ? `
            <a href="/home">Home</a>
            <form method='post' action='/logout'>
                <button type='submit'>Logout</button>
            </form>
        ` : `
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        `}
    `);
});

app.get('/home', redirectLogin, (req, res) => {
    const user = users.find(user => user.id === req.session.userId);
    res.send(`
        <h1>Home</h1>
        <a href='/'>Main</a>
        <ul>
            <li>Name: ${user.name}</li>
            <li>Email: ${user.email}</li>
        </ul>
    `);
});

app.get('/login', redirectHome, (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form method='post' action='/login'>
            <input type='email' name='email' placeholder='Email' required />
            <input type='password' name='password' placeholder='Password' required />
            <input type='submit' />
        </form>
        <a href='/register'>Register</a>
    `);
});

app.get('/register', redirectHome, (req, res) => {
    res.send(`
        <h1>Register</h1>
        <form method='post' action='/register'>
            <input type='name' name='name' placeholder='Name' required />
            <input type='email' name='email' placeholder='Email' required />
            <input type='password' name='password' placeholder='Password' required />
            <input type='submit' />
        </form>
        <a href='/login'>Login</a>
    `);
});

app.post('/login', redirectHome, (req, res) => {
    const { password, email } = req.body;

    if (password && email) {
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            req.session.userId = user.id;
            return res.redirect('/home');
        }
    }

    res.redirect('/login');
});

app.post('/register', redirectHome, (req, res) => {
    const { name, email, password } = req.body;
    if (name && email && password) {
        const exists = users.some(user => user.email === email); // Return boolean

        if (!exists) {
            const user = {
                id: users.length + 1,
                name: name,
                email: email,
                password: password
            };

            users.push(user); 
            
            req.session.userId = user.id;
            return res.redirect('/home');
        } 
    }

    res.redirect('/register');
});

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.redirect('/home');
        }

        res.clearCookie(SESS_NAME);
        res.redirect('/login');
    })
});

app.listen(PORT, () => console.log(
    `http://localhost:${PORT}`
));