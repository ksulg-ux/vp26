const fs = require('fs').promises;
const dateTime = require('../src/dateTimeET.js');
const path = require('path');
const regTextRef = path.join(
    __dirname,
    '../public/txt/visits.txt'
);

//@desc page for registering your visit
//@route GET /regvisit
//@access public

const registervisit = (req, res) => {
	res.render('regvisit');
};

//@desc page for registering your visit
//@route POST /regvisit
//@access public

const registervisitPost = async (req, res) => {
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
};

//@desc page for seeing last visits
//@route GET /lastvisit
//@access public

const lastvisit = async (req, res) => {
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
};

module.exports = {
	registervisit,
	registervisitPost,
	lastvisit
};
