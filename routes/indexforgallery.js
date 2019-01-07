const {MongoClient} = require('mongodb');

var express = require('express');
var router = express.Router();
var Readable = require('stream').Readable;

module.exports = function (app, Gallery, gfs) {

    // GET ALL Images Uri
    router.get('', function (req, res) {
        Gallery.find(function (err, docs) {
            if (err) return res.status(500).send({
                error: 'database failure'
            });
            res.json(docs);
        });
    });

    // GET Images Uri BY Facebook ID
    router.get('/fbid/:fbid', function (req, res) {
        Gallery.find({
            fbid: req.params.fbid
        }, function (err, docs) {
            if (err) return res.status(500).json({
                error: err
            });
            res.json(docs);
        })
    });

    router.get('/image/:imageHash', function (req, res) {
        console.log(req.params.imageHash);

        try {
            var readStream = gfs.createReadStream({
                "filename": req.params.imageHash
              });

            const chunks = [];

            readStream.on("data", function (chunk) {
                    chunks.push(chunk);
            });
                
            // Send the buffer or you can put it into a var
            readStream.on("end", function () {
                str = (Buffer.concat(chunks)).toString();

                // console.log(str);

                res.send({"imageHash": req.params.imageHash, "imageFile": str});
            });
        } catch (e) {
            console.log(e);
        }
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
                    console.log(file.filename + " -- Uploaded!");
                    console.log("_id: " + writestream.id);
                });

               
                gallery.save(function (err) {
                    if (err) {
                        res.json({ result: 0 });
                        return console.error(err);
                    }
                    res.json({
                        "fbid": gallery.fbid,
                        "imageHash": gallery.imageHash,
                        "imageUri": gallery.imageUri
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