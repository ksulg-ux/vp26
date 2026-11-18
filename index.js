const express = require('express');
const fs = require('fs').promises;
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonnam,uutujate lugemiseks
require('dotenv').config();

const dateTime = require('./src/dateTimeET.js');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const checkLogin = require('./src/checkLogin');
const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//käivitan express funktsiooni ja tähistan töötava asja nimega "app"
const app = express();
//määrame sessiooni halduse
//esimene varjant kasutas default memorystore'i ja säilitas vaid ühe sessiooni korraga
//app.use(session({secret: process.env.SES_SECRET, saveUninitialisezed: false, resave: true}));
const sessionStore = new MySQLStore({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaisa_sulg'
		});
app.use(session({
	secret: process.env.SES_SECRET,
	store: sessionStore,
	saveUninitialisezed: false,
	resave: false,
	cookie: {
		maxAge: 1000 * 60 * 1 //sessioon aegub tunniga
	}
}));

app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    res.locals.userEmail = req.session.userEmail;
    res.locals.firstName = req.session.firstName;
    res.locals.lastName = req.session.lastName;
    next();
});
//määrame veebilehe mallide järgi renderdamise mootori (EJS)
app.set('view engine', 'ejs');
//muudan "public" veebiserverile kättesaadavaks
app.use(express.static('public'));
//hakkame päringuid parsima
app.use(bodyparser.urlencoded({extended: true}));

//marsruudid
app.get('/', async (req, res)=>{
	//res.send('Express.js veeb käivitus!')
	const day = dateTime.weekdayET();
	const date = dateTime.dateET();
	const time = dateTime.timeET();
	conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaisa_sulg'
	});
	const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)';
	const [result] = await conn.execute(sqlReq, [3]);
	res.render('index', {day: day, date: date, time: time, latestPhoto: result.length > 0 ? result[0] : null});
});

app.get('/home', checkLogin.isLogin, (req, res) => {
	res.render('home');
});

app.get('/logout', async (req, res)=>{
	req.session.destroy();
	res.redirect('/');
});

app.get('/vanasona', async (req, res)=>{
	try{
		const data = await fs.readFile(textRef, 'utf8');
		let folkWisdom = data.split(';');
		let wisdom = folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))];
		res.render('wisdom', {wisdom: wisdom});
	}
	catch (err){
		console.log(err);
		res.render('wisdom', {wisdom: 'Kahjuks ühtegi vanasõna ei leitud!'});
	}
});

app.get('/minust', (req, res) => {
res.render('minust');
});
 
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

const visitRouter = require('./routes/visitRoutes');
app.use('/', visitRouter);

const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryphotoupload', galleryPhotoUploadRouter);

const galleryRouter = require('./routes/galleryRoutes');
app.use('/fotogalerii', galleryRouter);

const mygalleryRouter = require('./routes/mygalleryRoutes');
app.use('/mygallery', mygalleryRouter);

const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);

const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);

app.listen(5388);