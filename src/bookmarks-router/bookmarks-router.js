const path = require('path');
const express = require('express');
const {isWebUri} = require('valid-url');
const xss = require('xss');
const logger = require('../logger');
const BookmarksService = require('./bookmarks-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating)
});

bookmarkRouter
    .route('/')
    .get((req, res, next) => {
        BookmarksService.getAllBookmarks(req.app.get('db'))
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        // TODO: update to use db
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: {message: `'${field}' is required`}
                })
            }
        }

        const {title, url, description, rating} = req.body;

        const ratingNum = Number(rating);

        if(!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send({
                error: {message: `'rating' must be a number between 0 and 5`}
            })
        }

        if(!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send({
                error: {message: `'url' must be a valid URL`}
            })
        }
        // below updates to use db
        const newBookmark = {title, url, description, rating};

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${bookmark.id}`))
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)

        /*
        const bm = {
            id: uuid(),
            title,
            url,
            description,
            rating
        };

        store.bookmarks.push(bm);
        logger.info(`Bookmark with id ${bm.id} created`);
        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bm.id}`)
            .json(bm);
        */
    });

bookmarkRouter
    .route('/:id')
    .all((req, res, next) => {
        const {id} = req.params;
        BookmarksService.getById(req.app.get('db'), id)
            .then(bookmark => {
                if(!bookmark) {
                    logger.error(`Bookmark with id ${id} not found.`)
                    return res.status(404).json({
                        error: {message: 'Bookmark not found'}
                    })
                }
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        const {id} = req.params;
        BookmarksService.deleteBookmark(
            req.app.get('db'),
            id
        )
            .then(numRowsAffected => {
                logger.info(`Bookmark with id ${id} deleted`)
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const {title, url, description, rating} = req.body;
        const articleToUpdate = {title, url, description, rating};

        const numberOfValues = Object.values(articleToUpdate).filter(Boolean).length
        if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'title', 'url', 'description', or 'rating'`
                }
            })
        }
        if(rating && (!Number.isInteger(rating) || rating < 0 || rating > 5)) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).json({
                error: {
                    message: `'rating' must be a number between 0 and 5`
                }
            })
        }
        if(url && !isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).json({
                error: {
                    message: `'url' must be a valid url`
                }
            })
        }

        BookmarksService.updateBookmark(
            req.app.get('db'),
            req.params.id,
            articleToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarkRouter;