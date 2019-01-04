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
    })
});

// GET SINGLE CONTACT
app.get('/api/contacts/:contact_id', function (req, res) {
    Contact.findOne({
        _id: req.params.contact_id
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


// CREATE CONTACT
app.post('/api/contacts', function (req, res) {

    var contact = new Contact();
    contact.name = req.body.name;
    contact.number = req.body.number;
    contact.img = req.body.img;



    MongoClient.connect('mongodb://localhost:27017', (err, client) => {
        if (err) {
            return console.log('Unable to connect');
        }
        const db = client.db('mongodb_tutorial');
        db.collection('contacts').find({
            name: req.body.name
        }).count().then((count) => {if (count === 0) {
            console.log("dsad");
            contact.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({
                        result: 0
                    });
                    return;
                }
        
                res.json({
                    result: 1
                });
        
        
        
            });
        } 
        }, (err) => {
            console.log(err);
        });
    });



});


// UPDATE THE CONTACT
app.put('/api/contacts/:contact_id', function (req, res) {
    Contact.update({
        _id: req.params.contact_id,
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

// DELETE CONTACT
app.delete('/api/contacts/:contact_id', function (req, res) {
    Contact.remove({
        _id: req.params.contact_id
    }, function (err, output) {
        if (err) return res.status(500).json({
            error: "database failure"
        });

        /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
        if(!output.result.n) return res.status(404).json({ error: "contact not found" });
        res.json({ message: "contact deleted" });
        */

        res.status(204).end();
    })
});

// DELETE ALL CONTACT
app.delete('/api/contacts', function (req, res) {
    Contact.remove({}, function (err, output) {
        if (err) return res.status(500).json({
            error: "database failure"
        });

        /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
        if(!output.result.n) return res.status(404).json({ error: "contact not found" });
        res.json({ message: "contact deleted" });
        */

        res.status(204).end();
    })
});



}