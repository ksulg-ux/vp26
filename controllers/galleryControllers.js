const mysql = require("mysql2/promise");
require("dotenv").config();

exports.gallery = async (req, res) => {

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: "if26_kaisa_sulg"
    });

    const sqlReq = `
        SELECT filename, alttext
        FROM galleryphotos
        WHERE privacy >= 2
        AND deleted IS NULL
        ORDER BY id DESC
    `;

    const [photos] = await conn.execute(sqlReq);

    res.render("gallery", {
        photos: photos
    });

    await conn.end();
};
