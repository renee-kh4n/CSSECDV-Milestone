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

app.post('/register', (req, res) =>{
    console.log(req.body);
    res.redirect('/login');
})

app.post('/login', (req, res) =>{
    console.log(req.body);
    res.redirect('/admin'); //change, for testing purposes only
})

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
