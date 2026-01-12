const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('./db');
const exphbs = require('express-handlebars');
const multer = require('multer');
const upload = multer();
const session = require('express-session');
const supabase = require('./supabase');

const app = express();

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


// auth middleware
function isAdmin(req, res, next){
  if(req.session.user && req.session.user.role === 'admin'){
    return next();
  }else{
    return res.status(403).send('Access Denied!');
  }

}

function isLoggedin(req, res, next){
  if(req.session.user){
    return next();
  }else{
    return res.status(403).send('Access Denied!');
  }

}

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // pass session to template
  next();
});

// Routes
app.get('/', (req, res) => {
  if(req.session.user){
    res.redirect('/home');
  }else{
    res.redirect('/login');
  }
  
});

app.get('/home', isLoggedin, (req,res) => {
  res.render('home', { title: 'Home Page'});
})

app.get('/profile', isLoggedin, (req,res) => {
  res.render('profile', { title: 'profile'});
})

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});





app.get('/admin', isAdmin, async (req, res) => {



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

// app.post('/register',  upload.single('pfp'), async (req, res) =>{ 
//     console.log('app register');
//     console.log('Content-Type:', req.headers['content-type']);
//     console.log('Body:', req.body);
//     // res.send('ok');
//     console.log(req.file); // uploaded file

//     try{ 
//         // store image in supabase bucket
//         const { firstName, lastName, email, phoneNumber, password} = req.body;

//         if(!firstName || !lastName || !email || !phoneNumber || !password){
//             return res.status(400).send('Missing required fields');
//         }

//         // check if mail exists
//         const chackMail = `SELECT user_ID, role, password FROM users WHERE email=$1`;

//         const rows = await pool.query(chackMail, [email]);

//         if(rows.rowCount > 0){
//           console.log("email exists");
//           return res.json({
//             success: false
//           })
//         } 

//         const passwordHash = await bcrypt.hash(password, 10);

//         const query = `
//         INSERT INTO users
//             (first_name, last_name, email, phone_number, password)
//             VALUES ($1, $2, $3, $4, $5)`;

//         await pool.query(query, [
//             firstName, lastName, email, phoneNumber, passwordHash
//         ]);

//         console.log("uploaded contents to db");
//         return res.json({
//           success: true
//         });
        
//     }catch(err){
//         console.error(err);
//         return res.status(500).send('Server Error');
//     }
// })



app.post('/register', upload.single('pfp'), async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    if(!firstName || !lastName || !email || !phoneNumber || !password){
        return res.status(400).send('Missing required fields');
    }

    // check if mail exists
    const chackMail = `SELECT user_ID, role, password FROM users WHERE email=$1`;

    const rows = await pool.query(chackMail, [email]);

    if(rows.rowCount > 0){
      console.log("email exists");
      return res.json({
        success: false
      })
    } 

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique filename
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;

    // Upload to Supabase bucket
    const { data, error } = await supabase.storage
      .from('pfp')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ success: false });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('pfp')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Save imageUrl in database
    await pool.query(
      `INSERT INTO users (first_name, last_name, email, phone_number, password, pfp)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [firstName, lastName, email, phoneNumber, passwordHash, imageUrl]
    );

    return res.json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
});


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

      //save user session

      req.session.user = {
        id: user.user_ID,
        role: user.role
      }

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

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
