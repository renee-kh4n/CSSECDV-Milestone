const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();

const authRoutes = require("./src/routes/auth.routes")

app.use(session({
  secret: 'someVerySecretString',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// Parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve frontend assets
app.use(express.static('public'));


// Handlebars setup
const hbs = exphbs.create({
  extname: 'hbs',
  helpers: {
    eq: (a, b) => a === b
  }
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // pass session to template
  next();
});

app.use(authRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
