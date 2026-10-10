const express = require('express');
const fs = require('fs').promises;
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks (koos async ehk ootamise osaga)
const mysql = require('mysql2/promise');
//moodul .env keskkonnam,uutujate lugemiseks
require('dotenv').config();

const dateTime = require('./src/dateTimeET.js');

const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//käivitan express funktsiooni ja tähistan töötava asja nimega "app"
const app = express();
//määrame veebilehe mallide järgi renderdamise mootori (EJS)
app.set('view engine', 'ejs');
//muudan "public" veebiserverile kättesaadavaks
app.use(express.static('public'));
//hakkame päringuid parsima
app.use(bodyparser.urlencoded({extended: false}));

//marsruudid
app.get('/', (req, res)=>{
	//res.send('Express.js veeb käivitus!')
	const day = dateTime.weekdayET();
	const date = dateTime.dateET();
	const time = dateTime.timeET();
	res.render('index', {day: day, date: date, time: time});
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

app.get('/regvisit', (req, res) => {
	res.render('regvisit');
});

app.post('/regvisit', async (req, res) => {
    console.log(req.body);

    const date = dateTime.dateET();
    const time = dateTime.timeET();

    try {
        await fs.open(regTextRef, 'a');
        await fs.appendFile(
            regTextRef,
            req.body.nameInput + ',' + date + ',' + time + ';'
        );
        res.render('regvisit');
    }
    catch (err) {
        console.log(err);
        res.render('regvisit');
    }
});

app.get('/eestifilm', (req, res)=>{
	res.render('eestifilm');
});

app.get('/eestifilm/film_inimesed', async (req, res)=>{
	let conn;
	try {
		conn = await mysql.createConnection({
			host: 'localhost',
			user: 'if26',
			password: 'ifikas26',
			database: 'if26_kaisa_sulg'
		});
		//defineerime SQL pÃ¤ringu
		let sqlReq = 'SELECT person.*, picture.file_name FROM person LEFT Join picture ON picture.person_id = person.id';
		//kÃ¤ivitame pÃ¤ringu
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('film_inimesed', {personList: sqlRes});
	}
	catch (err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
		res.render('film_inimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/lisa_film_inimesed', (req, res)=>{
    res.render('lisa_film_inimesed', {
        notice: 'Ootan sisestust!',
        firstName: '',
        lastName: '',
        bornDate: '',
        deceasedDate: ''
    });
});

app.post('/eestifilm/lisa_film_inimesed', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmeid, teeme kÃµige lahjema kontrolli
	let deceasedDate = null;
	if(req.body.deceasedInput != ''){
		deceasedDate = new Date(req.body.deceasedInput);
		
		if (
        isNaN(deceasedDate.getTime()) ||
        deceasedDate > timeNow ||
        deceasedDate < bornDate
    ){
        return res.render('lisa_film_inimesed', {
            notice: 'Surmakuupäev pole korrektne!',
            firstName: req.body.firstNameInput,
            lastName: req.body.lastNameInput,
            bornDate: req.body.bornInput,
            deceasedDate: req.body.deceasedInput
        });
    }

    deceasedDate = req.body.deceasedInput;
}
	
	//sÃ¼nnikuupÃ¤eva vÃµrdlemine
	const bornDate = new Date(req.body.bornInput);
	const timeNow = new Date();
	
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > timeNow){
		console.log("Andmed pole korrektsed!");
		return res.render('lisa_film_inimesed', {notice: 'Sisestud andmed pole korrektsed!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_kaisa_sulg'
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('lisa_film_inimesed', {notice: req.body.firstNameInput + ' ' + req.body.lastNameInput + ' andmebaasi salvestatud.'});
	}
	catch (err) {
		console.log('Andmebaasiga suhtlemise viga: ' + err);
		res.render('lisa_film_inimesed', {notice: 'Tekkis viga, andmeid ei salvestatud!'}); 
	}
	finally {
		if(conn){
			await conn.end();
		}
	}	
});

app.get('/eestifilm/lisa_film', (req, res) => {
    res.render('lisa_film', {
        notice: 'Ootan sisestust!',
        title: '',
        releaseYear: '',
        duration: '',
        description: ''
    });
});

app.post('/eestifilm/lisa_film', async (req, res) => {

    const currentYear = new Date().getFullYear();

    if (
        !req.body.titleInput ||
        req.body.releaseYearInput < 1895 ||
        req.body.releaseYearInput > currentYear ||
        req.body.durationInput <= 0
    ) {

        return res.render('lisa_film', {
            notice: 'Andmed pole korrektsed!',
            title: req.body.titleInput,
            releaseYear: req.body.releaseYearInput,
            duration: req.body.durationInput,
            description: req.body.descriptionInput
        });
    }

    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'if26_kaisa_sulg'
        });

        let sqlReq = `
            INSERT INTO movie
            (title, release_year, duration_minutes, description)
            VALUES (?, ?, ?, ?)
        `;

        await conn.execute(sqlReq, [
            req.body.titleInput,
            req.body.releaseYearInput,
            req.body.durationInput,
            req.body.descriptionInput
        ]);

        res.render('lisa_film', {
            notice: 'Film salvestatud!',
            title: '',
            releaseYear: '',
            duration: '',
            description: ''
        });

    } catch(err) {
        console.log(err);
    } finally {
        if(conn){
            await conn.end();
        }
    }
});

app.get('/eestifilm/lisa_zanr', (req, res) => {
    res.render('lisa_zanr', {
        notice: 'Ootan sisestust!',
        genreName: '',
		description: ''
    });
});

app.post('/eestifilm/lisa_zanr', async (req, res) => {

    if(!req.body.genreInput){
        return res.render('lisa_zanr', {
            notice: 'Žanri nimi puudub!',
            genreName: req.body.genreInput,
			description: req.body.descriptionInput
        });
    }

    let conn;

    try{
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'if26_kaisa_sulg'
        });

        let sqlReq = 'INSERT INTO genre (name, description) VALUES (?, ?)';

        await conn.execute(sqlReq, [
			req.body.genreInput,
			req.body.descriptionInput
		]);

        res.render('lisa_zanr', {
            notice: 'Žanr salvestatud!',
            genreName: '',
			description: ''
        });

    } catch(err){
        console.log(err);
    } finally{
        if(conn){
            await conn.end();
        }
    }
});


app.get('/minust', (req, res) => {
res.render('minust');
});

app.get('/lastvisit', async (req, res) => {
    try {
        const data = await fs.readFile(regTextRef, 'utf8');

        let visitList = data.split(';');

        let lastVisit = visitList[visitList.length - 2];

        let visitData = lastVisit.split(',');

        res.render('lastvisit', {
            name: visitData[0],
            date: visitData[1],
            time: visitData[2]
        });
    }
    catch (err) {
        console.log(err);
        res.render('lastvisit', {
            name: 'puudub',
            date: 'puudub',
            time: 'puudub'
        });
    }
});

app.listen(5318);