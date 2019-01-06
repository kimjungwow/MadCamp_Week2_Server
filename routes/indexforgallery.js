const {MongoClient} = require('mongodb');

var express = require('express');
var router = express.Router();
var Readable = require('stream').Readable;

module.exports = function (app, Gallery, gfs) {

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
            // if (docs.length === 0) return res.status(404).json({
            //     error: 'images not found'
            // });
            res.json(docs);
        })
    });


    // CREATE Images using GridFS
    router.post('', function (req, res) {
        Gallery.find({
            fbid: req.body.fbid,
            imageHash: req.body.imageHash
        }, function (err, docs) {
            console.log("count : %d", docs.length);

            if (docs.length === 0) {
                var gallery = new Gallery();
                

                gallery.fbid = req.body.fbid;
                gallery.imageHash = req.body.imageHash;
                gallery.imageUri = req.body.imageUri;

                var writestream = gfs.createWriteStream({ filename: gallery.imageHash });

                var tmpStream = new Readable;
                tmpStream.push(req.body.imageFile);
                tmpStream.push(null)
                tmpStream.pipe(writestream);

                writestream.on('close', function (file) {
                    console.log(file.filename + "Uploaded!");
                    console.log("_id: " + writestream.id);
                });

                // var readStream = gfs.createReadStream({
                //     _id: '5c322b64cc385c7c91bb62b9',
                //   });

                //   const chunks = [];

                //   readStream.on("data", function (chunk) {
                //     chunks.push(chunk);
                //   });
                
                //   // Send the buffer or you can put it into a var
                //   readStream.on("end", function () {
                //     str = (Buffer.concat(chunks)).toString();
                //     console.log(str);
                //   });

                // Need to set storage Path!
                // Connect to the db

               
                gallery.save(function (err) {
                    if (err) {
                        res.json({ result: 0 });
                        return console.error(err);
                    }
                    res.json({
                        "fbid": gallery.fbid,
                        "imageHash": gallery.imageHash,
                        "imageUri": gallery.imageUrii,
                        "imageFile": gallery.imageFile
                        // storagePath =
                    });
                });
            } else {
                return console.log("Duplicated!");
            }
        });
    });


    // DELETE ALL Images OF SPECIFIC ACCOUNT
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

    // DELETE ALL Images
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