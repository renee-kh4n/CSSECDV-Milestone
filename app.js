const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const exphbs = require('express-handlebars');
const multer = require('multer');
const upload = multer();

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

app.get('/admin', async (req, res) => {

  try{
    const query = `SELECT * FROM users`;

    const result = await pool.query(query);

    const users = result.rows.map(u => ({
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phoneNumber: u.phone_number,
      photo: u.photo || '',
      role: u.role
    }));

    res.render('admin', { title: 'Admin Panel', users} )

  } catch (err){
    console.error(err);
    res.status(500).send('Server error');
  }
  
});

app.post('/register',  upload.single('pfp'), async (req, res) =>{ 
    console.log('app register');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    // res.send('ok');
    console.log(req.file); // uploaded file

    try{ 
        // store image in supabase bucket
        const { firstName, lastName, email, phoneNumber, password} = req.body;

        if(!firstName || !lastName || !email || !phoneNumber || !password){
            return res.status(400).send('Missing required fields');
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const query = `
        INSERT INTO users
            (first_name, last_name, email, phone_number, password)
            VALUES ($1, $2, $3, $4, $5)`;

        await pool.query(query, [
            firstName, lastName, email, phoneNumber, passwordHash
        ]);

        console.log("uploaded contents to db");
        return res.json({
          success: true
        });
        
    }catch(err){
        console.error(err);
        return res.status(500).send('Server Error');
    }
})

// app.post('/login', (req, res) =>{
//     console.log(req.body);
//     res.redirect('/admin'); //change, for testing purposes only
// })

app.post('/login', async (req, res) => {
    console.log(req.body);
  try{
    
    const { email, password} = req.body;

      if(!email || !password){
        return res.status(400).send('Missing required fields');
    }

    const query = `SELECT user_ID, role, password FROM users WHERE email=$1`;

    const rows = await pool.query(query, [email]);

    if(rows.rowCount < 1){
      console.log("no email");
      // return res.status(401).send('Invalid Credentials');
       return res.json({
        success: false
      })
    } 

    const user = rows.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if(match){
      console.log("correct password");
      return res.json({
        success: true,
        role: user.role
      })
    } else{
      console.log("wrong password");
      // return res.status(401).send('Invalid Credentials');
       return res.json({
        success: false
      })
    }


  } catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }

})

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
