const mysql = require('mysql2/promise');

//@desc Photogallery
//@route GET /gallery
//@access public

const galleryPage = async (req, res) => {
	let conn;
	try {
		const sqlReq = 'SELECT filename, alttext FROM galleryphotos WHERE privacy >= ? AND deleted IS NULL';
		const privacy = 2;
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_DATABASE
		});
		const [photos] = await conn.execute(sqlReq, [privacy]);
		let galleryData = [];
		for (let i = 0; i < photos.length; i ++){
			let altText = "Galeriipilt";
			if(photos[i].alttext != ""){
				altText = photos[i].altText;
			}
			galleryData.push({src: photos[i].filename, alt: altText});
		}
		res.render('gallery', {galleryData: galleryData, imagehref: process.env.GALLERY_THUMBNAIL});
	}
	catch (err) {
		console.log('Viga: ' + err);
		res.render('gallery', {galleryData: [], imagehref: process.env.GALLERY_THUMBNAIL});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
	
	//res.render('gallery');
};

//@desc Logged-in user's photos
//@route GET /gallery/mygallery
//@access private

const myGalleryPage = async (req, res) => {

    let conn;

    try {

        const sqlReq = `
            SELECT filename, alttext, privacy
            FROM galleryphotos
            WHERE userid = ?
            AND deleted IS NULL
            ORDER BY created DESC
        `;

        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
        });

        const [photos] = await conn.execute(sqlReq, [req.session.userId]);

        res.render('mygallery', {
            photos: photos,
            imagehref: process.env.GALLERY_THUMBNAIL
        });

    } catch(err) {
        console.log("Viga: " + err);

        res.render('mygallery', {
            photos: [],
            imagehref: process.env.GALLERY_THUMBNAIL
        });
    } finally {
        if(conn){
            await conn.end();
        }
    }
};

module.exports = {
	galleryPage,
	myGalleryPage
};