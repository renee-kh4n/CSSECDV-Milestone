require('dotenv').config();
const express = require('express');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const exphbs = require('express-handlebars');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const pool = require('./src/db');
const routes = require('./src/routes/index')

const app = express();

const hbs = exphbs.create({
    extname: 'hbs',
    helpers: {
        eq: (a, b) => a === b
    }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'src', 'views'));

app.use(
    helmet({
        xFrameOptions: { action: 'deny' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        crossOriginEmbedderPolicy: { policy: 'require-corp' },
        contentSecurityPolicy: {
            directives: {
                imgSrc: ["'self'", 'https://aencmgoursnonycqfbjd.supabase.co'],
            },
        },
    }),
);

app.use(session({
    name: 'cssecdv.id',
    store: new PgSession({
        pool,
        createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000
    }
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
    if (req.session.rateLimited && req.path !== '/limit') {
        return res.redirect('/limit');
    }
    next();
});

app.get('/limit', (req, res) => {
    if (!req.session.rateLimited) {
        return res.redirect('/');
    }
    res.render('limit');
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.errorMessage = req.session.errorMessage || null;
    delete req.session.errorMessage;
    next();
});

app.use(routes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
