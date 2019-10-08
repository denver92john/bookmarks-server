require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {NODE_ENV} = require('./config');
const validateBearerToken = require('./validate-bearer-token');
const errorHandler = require('./error-handler');
const bookmarkRouter = require('./bookmarks-router/bookmarks-router');

const app = express();

const morganOptions = (NODE_ENV === 'production')
    ? 'tiny'
    : 'dev';

app.use(morgan(morganOptions));
app.use(helmet());
app.use(cors());

app.use(validateBearerToken);

app.use('/api/bookmarks', bookmarkRouter);

app.get('/', (req, res) => {
    res.send('Hello, world!')
});

app.use(errorHandler);

module.exports = app;