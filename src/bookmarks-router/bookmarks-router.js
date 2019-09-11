const express = require('express');
const uuid = require('uuid/v4');
const logger = require('../logger');
const {bookmarks} = require('../store');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter.route('/bookmarks')
    .get((req, res) => {
        res.json(bookmarks);
    })
    .post(bodyParser, (req, res) => {
        const {title, url, description="", rating=5} = req.body;

        if(!title) {
            logger.error(`Title is required`);
            return res
                .status(400)
                .send(`Invalid data`);
        }
        if(!url) {
            logger.error(`Url is required`);
            return res
                .status(400)
                .send(`Invalid data`);
        }

        const id = uuid();
        const bm = {
            id,
            title,
            url,
            description,
            rating
        };

        bookmarks.push(bm);
        logger.info(`Bookmark with id ${id} created`);
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bm);
    });

bookmarkRouter.route('/bookmarks/:id')
    .get((req, res) => {
        const {id} = req.params;
        const bm = bookmarks.find(b => b.id == id);

        if(!bm) {
            logger.error(`Bookmark with id ${id} not found`);
            return res
                .status(404)
                .send('Bookmark not found');
        }
        res.json(bm);
    })
    .delete((req, res) => {
        const {id} = req.params;
        const bmIndex = bookmarks.findIndex(b => b.id == id);

        if(bmIndex === -1) {
            logger.error(`Bookmark with id ${id} not found`);
            return res
                .status(404)
                .send('Not Found');
        }

        bookmarks.splice(bmIndex, 1);
        logger.info(`Bookmark with id ${id} deleted`);
        res
            .status(204)
            .end();
    });

module.exports = bookmarkRouter;