require('dotenv').config();
const express = require('express');
const status = require('http-status');
const app = express();
const fs = require('fs')

const { init, getAds, getAd, deleteAd, addAd, updateAd, deleteMany } = require('./db');

let debugOn;
if (process.argv[2] == 'debug') {
    debugOn = true;
} else {
    debugOn = false;
};
const saveLogs = (req, res, next) => {
    if (debugOn) {
        const data = new Date() + " " + req.method + " " + req.path;
        const file = 'debug.txt';
        fs.appendFile(file, data + "\n", "utf8", (err) => {
            if (err) {
                throw err;
            }
        });
        next();
    } else {
        next();
    };
};

app.use(express.json(), saveLogs);

init().then(() => {
    app.get('/notice', async (req, res) => {
        const notices = await getAds()
        try {
            if (notices.length !== 0) {
                res.send(notices);
            }
        } catch {
            res.statusCode = status.NO_CONTENT;
            res.send("No notices on board. Error: " + res.statusCode);
            console.log("No notices on board. Error: " + res.statusCode);
        }
    });

    app.get('/notice/:id', async (req, res) => {
        const { id } = req.params;
        const notice = await getAd(id);
        if (notice) {
            res.send(notice);
        }
        res.statusCode = status.NOT_FOUND;
        res.send("Notice doesn't exist. Code: " + res.statusCode);
        console.log("Notice doesn't exist. Code: " + res.statusCode);
    })

    app.post('/notice', async (req, res) => {
        const newNotice = req.body;
        const result = await addAd(newNotice);
        try {
            if (!newNotice.title || !newNotice.description || !newNotice.author || !newNotice.tags || !newNotice.category || !newNotice.price) {
                res.statusCode = status.BAD_REQUEST;
                res.send("Wrong data passed " + res.statusCode)
                console.log("Wrong data passed " + res.statusCode)
            } else if (result.insertedCount === 1) {
                res.statusCode = status.CREATED;
                res.send("Notice created" + res.statusCode);
                console.log("Notice created" + res.statusCode)
            }
        } catch {
            res.statusCode = status.INTERNAL_SERVER_ERROR;
            res.send("Error: " + res.statusCode);
            console.log("Error: " + res.statusCode);
        }
    })

    app.delete('/notice/:id', async (req, res) => {
        const { id } = req.params;
        const result = await deleteAd(id);
        if (result.deletedCount === 1) {
            res.statusCode = status.NO_CONTENT;
            res.send("Notice deleted. " + res.statusCode);
            console.log("Notice deleted. " + res.statusCode);
        } else {
            res.statusCode = status.NOT_FOUND;
            res.send("Error " + res.statusCode);
            console.log("Error " + res.statusCode);
        }
    })
    app.delete('/delete', async (req, res) => {
        const result = await deleteMany();
        try {
            if (result) {
                res.statusCode = status.NO_CONTENT;
                res.send(result);
            }
        } catch {
            res.statusCode = status.NOT_FOUND;
            res.send("Error " + res.statusCode);
            console.log("Error " + res.statusCode);
        }
    })

    app.patch('/notice/:id', async (req, res) => {
        const { id } = req.params;
        const modified = req.body;
        if (modified == null) {
            res.statusCode = status.BAD_REQUEST;
            res.send("Bad data. Error: " + res.statusCode);
            console.log("Bad data. Error: " + res.statusCode);
        } else {
            const result = await updateAd(id, modified);
            if (result.modifiedCount === 1) {
                res.statusCode = status.ACCEPTED;
                res.send("Updated. Code: " + res.statusCode);
                console.log("Updated. Code: " + res.statusCode);
            } else if (result.matchedCount === 1) {
                res.statusCode = status.CONFLICT;
                res.send("Nothing to update. Make some changes. Error: " + res.statusCode);
                console.log("Nothing to update. Make some changes. Error: " + res.statusCode);
            } else {
                res.statusCode = status.NOT_FOUND;
                res.send("Notice doesn't exist. Error: " + res.statusCode);
                console.log("Notice doesn't exist. Error: " + res.statusCode);
            }
        }
    });

    app.get('/heartbeat', (req, res) => {
        res.send(new Date().toString());
    })
})
    .finally(() => {
        app.all('*', (req, res) => {
            res.statusCode = status.NOT_FOUND;
            res.sendFile(__dirname + '/404.png')
        })
        app.listen(process.env.PORT, () => console.log('Server running'));
    })

