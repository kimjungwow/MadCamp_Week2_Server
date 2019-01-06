module.exports = function (app, Login) {

    // GET ALL LOGINS
    app.get('/api/logins', function (req, res) {
        Login.find(function (err, logins) {
            if (err) return res.status(500).send({
                error: 'database failure'
            });
            res.json(logins);
        }).sort({
            "id": 1
        })
    });

    // // GET LOGIN BY NUMBER
    // app.get('/api/logins/number/:number', function (req, res) {
    //     Login.find({
    //         number: req.params.number
    //     }, {
    //         _id: 0,
    //         name: 1,
    //         /*img: 1*/
    //     }, function (err, logins) {
    //         if (err) return res.status(500).json({
    //             error: err
    //         });
    //         if (logins.length === 0) return res.status(404).json({
    //             error: 'login not found'
    //         });
    //         res.json(logins);
    //     })
    // });


    // // GET LOGIN BY NAME
    // app.get('/api/logins/name/:name', function (req, res) {
    //     Login.find({
    //         name: req.params.name
    //     }, {
    //         _id: 0,
    //         number: 1,
    //         /*img: 1*/
    //     }, function (err, logins) {
    //         if (err) return res.status(500).json({
    //             error: err
    //         });
    //         if (logins.length === 0) return res.status(404).json({
    //             error: 'login not found'
    //         });
    //         res.json(logins);
    //     })
    // });

    // // GET LOGIN BY Facebook ID
    // app.get('/api/logins/fbid/:fbid', function (req, res) {
    //     Login.find({
    //         fbid: req.params.fbid
    //     }, {
    //         _id: 0,
    //         number: 1,
    //         name: 1
    //         /*img: 1*/
    //     }, function (err, logins) {
    //         if (err) return res.status(500).json({
    //             error: err
    //         });
    //         if (logins.length === 0) return res.status(404).json({
    //             error: 'login not found'
    //         });
    //         res.json(logins);
    //     })
    // });


    // CREATE LOGIN
    app.post('/api/logins', function (req, res) {
        Login.find({
            
            id: req.body.id,
            password: req.body.password


        }, function (err, logins) {
            


            if (logins.length === 0) {


                var login = new Login();
                login.id = req.body.id;
                login.password = req.body.password;
                

                login.save(function (err) {
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
                    return;
                });
            } else {
                
                res.json({
                    result: 0
                });
                return;
            }
        });


    });


    // // UPDATE THE LOGIN
    // app.put('/api/logins/:login_id', function (req, res) {
    //     Login.update({
    //         _id: req.params.login_id,
    //         fbid: req.body.fbid,
    //         name: req.body.name,
    //         number: req.body.number
    //     }, {
    //         $set: req.body
    //     }, function (err, output) {
    //         if (err) res.status(500).json({
    //             error: 'database failure'
    //         });
    //         console.log(output);
    //         if (!output.n) return res.status(404).json({
    //             error: 'login not found'
    //         });
    //         res.json({
    //             message: 'login updated'
    //         });
    //     })
    //     /* [ ANOTHER WAY TO UPDATE THE LOGIN ]
    //             Login.findById(req.params.login_id, function(err, login){
    //             if(err) return res.status(500).json({ error: 'database failure' });
    //             if(!login) return res.status(404).json({ error: 'login not found' });

    //             if(req.body.name) login.name = req.body.name;
    //             if(req.body.number) login.number = req.body.number;
    //             if(req.body.published_date) login.published_date = req.body.published_date;

    //             login.save(function(err){
    //                 if(err) res.status(500).json({error: 'failed to update'});
    //                 res.json({message: 'login updated'});
    //             });

    //         });
    //     */
    // });



    // DELETE ALL LOGINS
    app.delete('/api/logins', function (req, res) {
        Login.remove({}, function (err, output) {
            if (err) return res.status(500).json({
                error: "database failure"
            });

            /* ( SINCE DELETE OPERATION IS IDEMPOTENT, NO NEED TO SPECIFY )
            if(!output.result.n) return res.status(404).json({ error: "login not found" });
            res.json({ message: "login deleted" });
            */
            console.log("All logins of fbid are deleted.");

            res.status(204).end();
        })
    });





}