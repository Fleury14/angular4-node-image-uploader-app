const express = require('express');
const router = express.Router();
const knex = require('../db/db');
const multer = require('multer');
const uuid = require('uuid');
const auth = require('../auth/auth');
const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION
});
const s3Bucket = new aws.S3({params:{ Bucket: process.env.S3_IMAGE_BUCKET } });

router.post('/upload', multer().array('images', 10), auth.isAuthenticated, async (req, res) => {
    try {
        console.log('File upload endpoint hit.');
        const savedFiles = [];
        console.log('Files request part:', req.files);
        console.log('req.user: ', req.user);
        for (let index in req.files) {
            console.log('Assigning ids and labels to values');
            let file = {
                id: uuid.v4(),
                userId: req.user,
                label: req.files[index].originalname
            };
            console.log('Values assigned..');
            savedFiles.push(file);

            let data = { Key: file.id, Body: req.files[index].buffer };
            console.log('Data object created, image pushed to finished array..');
            await s3Bucket.putObject(data, (err, data) => {
                if (err) {
                    console.log('Error uploading Image: ', err);
                } else {
                    console.log('Image uploaded: ', file.id);
                }
            });
        }
        console.log('Send to bucket complete, inserting labels to database');
        const savedImages = await knex('images').insert(savedFiles).returning('*');
        console.log('re mapping result to simplyt return id');
        const ids = savedImages.map(image => { return image.id; });
        res.status(200).json({ success: true, ids: ids});
    } catch (err) {
        res.status(500).json({ success: false, errorMessage: err});
    }
});

router.get('/test', auth.isAuthenticated, async (req, res) => {
    try {
        console.log('Images test endpoint it');
        res.json({test: 'Success'});
    } catch (err) {
        res.status(500).json({ test: 'Error', errorMessage: err});
    }
    
})

router.put('/image', auth.isAuthenticated, async (req, res) => {
    try {
        const image = await knex('images').select().where('id', req.body.id).first();
        if (!image || image.userId !== req.user) {
            return res.status(404).json({ success: false, errorMessage: 'Not found' });
        }

        image.label = req.body.label;
        await knex('images').where('id', req.body.id).update({ label: req.body.label });
        res.json({ success: true, id: req.body.id });
    } catch (err) {
        res.json(500).json({ success: false, errorMessage: err});
    }
});

router.delete('/image/:id', auth.isAuthenticated, async (req, res) => {
    try {
        const image = await knex('images').select().where('id', req.params.id).first();
        if (!image || images.userId !== req.user) {
            return res.status(404).json({ success: false, errorMessage: 'Not found' });
        }
        await knex('images').where('id', req.params.id).del();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ succes: false, errorMessage: err });
    }
});

router.get('/', auth.isAuthenticated, async (req, res) => {
    try {
        console.log('Image get request endpoint hit');
        console.log('user:', req.user);
        const userImages = await knex('images').select().where('userId', req.user);
        console.log('Request made, heres the result', userImages);
        for (let index in userImages) {
            let image = userImages[index];
            let url = await s3Bucket.getSignedUrl('getObject', { Key: image.id });
            image.url = url;
        }
        console.log('Loop that I dont know what it does is complete');
        
        res.json(userImages);
    } catch (err) {
        res.status(500).json({ success: false, errorMessage: err});
    }
})

module.exports = router;