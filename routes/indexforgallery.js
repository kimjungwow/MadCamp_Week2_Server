const {
    MongoClient
} = require('mongodb');

var express = require('express');
var router = express.Router();

module.exports = function (app, Gallery) {

    // GET ALL Images Url
    router.get('', function (req, res) {
        Gallery.find(function (err, docs) {
            if (err) return res.status(500).send({
                error: 'database failure'
            });
            res.json(docs);
        }).sort({
            "name": 1
        })
    });


    // GET Images Url BY Facebook ID
    router.get('/fbid/:fbid', function (req, res) {
        Gallery.find({
            fbid: req.params.fbid
        }, function (err, docs) {
            if (err) return res.status(500).json({
                error: err
            });
            if (docs.length === 0) return res.status(404).json({
                error: 'images not found'
            });
            res.json(docs);
        })
    });


    // CREATE Images
    router.post('', function (req, res) {
        Gallery.find({
            fbid: req.body.fbid,
            imgUri: req.body.imgUri
        }, function (err, docs) {
            console.log("count : %d, fbid : %s, name : %s", docs.length, req.body.fbid, req.body.imgUri);

            if (docs.length === 0) {


                var gallery = new Gallery();
                gallery.imgUri = req.body.imgUri;
                gallery.fbid = req.body.fbid;

                gallery.save(function (err) {
                    if (err) {
                        res.json({
                            result: 0
                        });
                        return console.error(err);
                    }
                    res.json({
                        result: 1
                    });
                });
            } else {
                return console.log("Duplicated!");
            }
        });
    });

    // DELETE ALL CONTACTS OF SPECIFIC ACCOUNT
    router.delete('/:fbid', function (req, res) {
        Gallery.remove({
            fbid: req.params.fbid
        }, function (err, output) {
            if (err) return res.status(500).json({
                error: "database failure"
            });

            /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
            if(!output.result.n) return res.status(404).json({ error: "contact not found" });
            res.json({ message: "contact deleted" });
            */
            console.log("All contacts of fbid are deleted.");

            res.status(204).end();
        })
    });

    // DELETE ALL CONTACTS
    router.delete('', function (req, res) {
        Gallery.remove({}, function (err, output) {
            if (err) return res.status(500).json({
                error: "database failure"
            });

            /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
            if(!output.result.n) return res.status(404).json({ error: "contact not found" });
            res.json({ message: "contact deleted" });
            */
            console.log("All contacts of fbid are deleted.");

            res.status(204).end();
        })
    });

    return router;
}