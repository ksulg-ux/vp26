const mysql = require('mysql2/promise');

//@desc home page for Estonian Film section
//@route GET /eestifilm
//@access public 

const eestifilm = (req, res) => {
	res.render('eestifilm');
};

//@desc page for people involved in Estonian Film indistry
//@route GET /eestifilm/film_inimesed
//@access public 

const eestifilmInimesed = async (req, res) => {
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
};

//@desc page for adding people involved in Estonian Film indistry
//@route GET /eestifilm/lisa_film_inimesed
//@access public 

const eestifilmInimesedLisa = (req, res)=>{
    res.render('lisa_film_inimesed', {
        notice: 'Ootan sisestust!',
        firstName: '',
        lastName: '',
        bornDate: '',
        deceasedDate: ''
    });
};

//@desc page for adding people involved in Estonian Film indistry
//@route POST /eestifilm/lisa_film_inimesed
//@access public 

const eestifilmInimesedLisaPost = async (req, res)=>{
	console.log(req.body);
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
};

//@desc page for adding films involved in Estonian Film indistry
//@route GET /eestifilm/lisa_film
//@access public 

const eestifilmidLisa = (req, res) => {
    res.render('lisa_film', {
        notice: 'Ootan sisestust!',
        title: '',
        releaseYear: '',
        duration: '',
        description: ''
    });
};

//@desc page for adding film involved in Estonian Film indistry
//@route POST /eestifilm/lisa_film
//@access public 

const eestifilmidPost = async (req, res) => {

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
};

//@desc page for adding zanr involved in Estonian Film indistry
//@route GET /eestifilm/lisa_zanr
//@access public 

const eestifilmZanrLisa = (req, res) => {
    res.render('lisa_zanr', {
        notice: 'Ootan sisestust!',
        genreName: '',
		description: ''
    });
};

//@desc page for zanr people involved in Estonian Film indistry
//@route POST /eestifilm/lisa_zarn
//@access public 

const eestifilmZanrPost = async (req, res) => {

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
};

//@desc page 
//@route GET /lisaSeos
//@access public

const lisaSeos = async (req, res) => {
    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'if26_kaisa_sulg'
        });

        const [persons] = await conn.execute(
            'SELECT id, first_name, last_name FROM person ORDER BY last_name'
        );

        const [movies] = await conn.execute(
            'SELECT id, title FROM movie ORDER BY title'
        );

        const [professions] = await conn.execute(
            'SELECT id, title FROM profession ORDER BY title'
        );

        res.render('lisa_seos', {
            notice: 'Vali andmed',
            persons,
            movies,
            professions
        });

    } catch(err){
        console.log(err);
    } finally {
        if(conn){
            await conn.end();
        }
    }
};

const lisaSeosPost = async (req, res) => {

    let conn;

    try{
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'if26_kaisa_sulg'
        });

        const personId = req.body.personInput;
        const movieId = req.body.movieInput;
        const professionId = req.body.professionInput;
        const roleName = req.body.roleInput || null;

        const [existing] = await conn.execute(
            `SELECT id
            FROM person_in_movie
            WHERE person_id = ?
            AND movie_id = ?
            AND profession_id = ?
            AND IFNULL(character_name,'') = IFNULL(?, '')`,
            [personId, movieId, professionId, roleName]
        );

        if(existing.length > 0){
            return res.render('message', {
                notice: 'Selline seos on juba olemas!'
            });
        }

        await conn.execute(
            `INSERT INTO person_in_movie
            (person_id, movie_id, profession_id, character_name)
            VALUES (?, ?, ?, ?)`,
            [personId, movieId, professionId, roleName]
        );

        res.render('message', {
            notice: 'Seos on salvestatud!'
        });

    } catch(err){
        console.log(err);
    } finally{
        if(conn){
            await conn.end();
        }
    }
};

//@desc page for displaying relations
//@route GET /eestifilm/seosed
//@access public

const kuvaSeosed = async (req, res) => {
    let conn;

    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: 'if26_kaisa_sulg'
        });

        const [relations] = await conn.execute(`
			SELECT
				pim.character_name,
				p.first_name,
				p.last_name,
				m.title,
				pr.title AS profession_title
			FROM person_in_movie pim
			JOIN person p ON pim.person_id = p.id
			JOIN movie m ON pim.movie_id = m.id
			JOIN profession pr ON pim.profession_id = pr.id;
        `);

        res.render('seosed', {
            relations: relations
        });

    } catch(err){
        console.log(err);
    } finally {
        if(conn){
            await conn.end();
        }
    }
};

module.exports = {
	eestifilm,
	eestifilmInimesed,
	eestifilmInimesedLisa,
	eestifilmInimesedLisaPost,
	eestifilmidLisa,
	eestifilmidPost,
	eestifilmZanrLisa,
	eestifilmZanrPost,
	lisaSeos,
	lisaSeosPost,
	kuvaSeosed
};