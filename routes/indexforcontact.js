const {
    MongoClient
} = require('mongodb');


module.exports = function (app, Contact) {

    // GET ALL CONTACTS
    app.get('/api/contacts', function (req, res) {
        Contact.find(function (err, contacts) {
            if (err) return res.status(500).send({
                error: 'database failure'
            });
            res.json(contacts);
        }).sort({
            "name": 1
        })
    });

    // GET SINGLE CONTACT
    app.get('/api/contacts/:fbid', function (req, res) {
        Contact.find({
            fbid: req.params.fbid
        }, function (err, contact) {
            if (err) return res.status(500).json({
                error: err
            });
            if (!contact) return res.status(404).json({
                error: 'contact not found'
            });
            res.json(contact);
        })
    });

    // GET CONTACT BY NUMBER
    app.get('/api/contacts/number/:number', function (req, res) {
        Contact.find({
            number: req.params.number
        }, {
            _id: 0,
            name: 1,
            /*img: 1*/
        }, function (err, contacts) {
            if (err) return res.status(500).json({
                error: err
            });
            if (contacts.length === 0) return res.status(404).json({
                error: 'contact not found'
            });
            res.json(contacts);
        })
    });


    // GET CONTACT BY NAME
    app.get('/api/contacts/name/:name', function (req, res) {
        Contact.find({
            name: req.params.name
        }, {
            _id: 0,
            number: 1,
            /*img: 1*/
        }, function (err, contacts) {
            if (err) return res.status(500).json({
                error: err
            });
            if (contacts.length === 0) return res.status(404).json({
                error: 'contact not found'
            });
            res.json(contacts);
        })
    });

    // GET CONTACT BY Facebook ID
    app.get('/api/contacts/fbid/:fbid', function (req, res) {
        Contact.find({
            fbid: req.params.fbid
        }, {
            _id: 0,
            number: 1,
            name: 1
            /*img: 1*/
        }, function (err, contacts) {
            if (err) return res.status(500).json({
                error: err
            });
            if (contacts.length === 0) return res.status(404).json({
                error: 'contact not found'
            });
            res.json(contacts);
        })
    });


    // CREATE CONTACT
    app.post('/api/contacts', function (req, res) {


        Contact.find({
            fbid: req.body.fbid,
            name: req.body.name
        }, function (err, contacts) {
            console.log("count : %d, fbid : %s, name : %s", contacts.length, req.body.fbid, req.body.name);


            if (contacts.length === 0) {


                var contact = new Contact();
                contact.name = req.body.name;
                contact.number = req.body.number;
                contact.img = req.body.img;
                contact.fbid = req.body.fbid;

                contact.save(function (err) {
                    if (err) {
                        console.log("111");
                        console.error(err);
                        res.json({
                            result: 0
                        });
                        return;
                    }
                    res.json({
                        result: 1
                    });
                    return;
                });
            } else {
                console.log("duplication : " + req.body.name);
                res.json({
                    result: 0
                });
                return;
            }
        });


    });


    // UPDATE THE CONTACT
    app.put('/api/contacts/:contact_id', function (req, res) {
        Contact.update({
            _id: req.params.contact_id,
            fbid: req.body.fbid,
            name: req.body.name,
            number: req.body.number
        }, {
            $set: req.body
        }, function (err, output) {
            if (err) res.status(500).json({
                error: 'database failure'
            });
            console.log(output);
            if (!output.n) return res.status(404).json({
                error: 'contact not found'
            });
            res.json({
                message: 'contact updated'
            });
        })
        /* [ ANOTHER WAY TO UPDATE THE CONTACT ]
                Contact.findById(req.params.contact_id, function(err, contact){
                if(err) return res.status(500).json({ error: 'database failure' });
                if(!contact) return res.status(404).json({ error: 'contact not found' });

                if(req.body.name) contact.name = req.body.name;
                if(req.body.number) contact.number = req.body.number;
                if(req.body.published_date) contact.published_date = req.body.published_date;

                contact.save(function(err){
                    if(err) res.status(500).json({error: 'failed to update'});
                    res.json({message: 'contact updated'});
                });

            });
        */
    });


    // DELETE ALL CONTACTS OF SPECIFIC ACCOUNT
    app.delete('/api/contacts/:fbid', function (req, res) {
        Contact.remove({
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
    app.delete('/api/contacts', function (req, res) {
        Contact.remove({}, function (err, output) {
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





}