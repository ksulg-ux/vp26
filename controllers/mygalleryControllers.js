const mysql = require('mysql2/promise');

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
	myGalleryPage
};