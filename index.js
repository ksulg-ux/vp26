const express = require('express');
const dateTime = require('./src/dateTimeET.js');
const fs = require('fs').promises;
const bodyparser = require('body-parser');

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