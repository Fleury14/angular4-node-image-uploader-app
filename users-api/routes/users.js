const express = require('express');
const router = express.Router();
const knex = require('../db/db');
const moment = require('moment');
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');

router.post('/user', async (req, res) => {
    try {
        // create salt and hash password
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(req.body.password, salt);
        console.log('Executing query');
        // execute the sql query
        const user = await knex('users')
            .insert({ username: req.body.username, password: hash})
            .returning('*');
        console.log('Query executes, res.json successing...');
        // return success
        res.json({ success: true, token: encode(user[0]) });
    } catch (err) {
        res.status(500).json({ success: false, errorMessage: err })
    }
});

function encode(user) {
    console.log('encoding function called');
    console.log('env test', process.env.TOKEN_SECRET);
    const token = {
        exp: moment().add(7, 'days').unix(),
        iat: moment().unix(),
        sub: user.id
    };

    return jwt.encode(token, process.env.TOKEN_SECRET);
}

router.post('/login', async (req, res) => {
    try {

        const credentials = {
            username: req.body.username,
            password: req.body.password
        };

        const user = await knex('users').where({ username: credentials.username, }).first();
        if ( !user || !brcypt.compareSycnc(credentials.password, user.password)) {
            throw new Error('Incorrect password');
        }

        res.json({ success: true, token: encode(user) });

    } catch (err) {
        res.status(500).json({ status: 'error', message: err})
    }
});

router.get('/user', isAuthenticated, (req, res) => {
    res.json({
        status: 'success',
        user: req.user
    });
});

function decode(token, callback) {
    const decodedJwt = jwt.decode(token, process.env.TOKEN_SECRET)
    const now = moment().unix();

    if ( now > decodedJwt.exp) {
        callback('Token has expired');
    } else {
        callback(null, decodedJwt);
    }
}

function isAuthenticated(req, res, next) {
    console.log('Authentication check initiated...');
    if ( !(req.headers && req.headers.authorization) ) {
        return res.status(401).json({ errorMessage: 'Unauthorized' });
    }

    const token = req.headers.authorization;
    decode(token, async (err, payload) => {
        try {
            console.log('decoding token...');
            if (err) {
                return res.status(401).json({ errorMessage: 'Token expired' });
            }

            const user = await knex('users').where({ id: parseInt(payload.sub, 10)}).first();
            console.log('Token decoded: ', user);
            req.user = user.id;
            console.log('Authorization passes, req.user:', req.user);
            return next();

        } catch (err) {
            res.status(500).json({ errorMessage: error });
        }
    })
}

module.exports = router