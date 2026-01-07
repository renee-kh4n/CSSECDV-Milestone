const express = require('express');
const exphbs = require('express-handlebars');

const app = express();

// Parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve frontend assets
app.use(express.static('public'));

// Handlebars setup
app.engine('hbs', exphbs.engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

app.get('/admin', (req, res) => {
    res.render('admin', { title: 'Admin Panel'} )
})

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
