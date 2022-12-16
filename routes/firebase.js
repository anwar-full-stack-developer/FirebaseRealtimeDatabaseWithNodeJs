var express = require('express');

var router = express.Router();

//start firebase admin with realtime database integration
var firebaseAdmin = require("firebase-admin");

//firebase database auth key
var serviceAccount = require("../config/firebase-serviceAccountKey.json");

//initialize firebase app
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://fir-demo-42213-default-rtdb.firebaseio.com"
});


// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = firebaseAdmin.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function (snapshot) {
    console.log(snapshot.val());
});


/**
 * Get all users
 */
router.get('/', async function (req, res, next) {

    var usersRef = ref.child("users");

    //get all data 
    usersRef.once("value", await function (snapshot) {
        let users = snapshot.val();
        console.log(users);
        return res.status(200).json({
            statusCode: 200,
            status: "OK",
            data: users
        });
    });
});

/**
 * Check user exist or not
 */
router
    .route("/exists/:id")
    .get([
        async function (req, res, next) {
            const { id } = req.params;

            var usersRef = ref.child("users");

            usersRef.once('value', await function (snapshot) {
                // if (snapshot.exists()) {
                //     console.log('exists');
                // }

                if (snapshot.hasChild(id)) {
                    res.status(200).json({
                        statusCode: 200,
                        status: "OK",
                        message: "Record Exists in the database."
                    });
                } else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "OK",
                        message: "Record doesn't Exists in the database."
                    });
                }
            });

            //searching
            // usersRef.orderByKey().equalTo(id).once("value", await function(snapshot) {
            //   let users = snapshot.val();
            //   console.log(users);
            //   return res.json(users);
            // });

        }]);



/**
 * Get user by id
 * 
 */
router
    .route("/:id")
    .get([
        async function (req, res, next) {

            const { id } = req.params;

            var usersRef = ref.child("users");

            var user = usersRef.child(id);

            user.once('value', function (snap) {
                res.status(200).json({
                    statusCode: 200,
                    status: "OK",
                    data: snap.val()
                });
            });


            // usersRef.orderByKey().equalTo(id).once("value", await function(snapshot) {
            //   let users = snapshot.val();
            //   console.log(users);
            //   return res.json(users);
            // });

        }]);

/**
 * Save new user
 */
router.route("/")
    .post([
        async function (req, res, next) {

            let data = req.body;

            var usersRef = ref.child("users");

            usersRef.push(data, await function (err) {
                if (err) {
                    res.status(300).json({
                        statusCode: 300,
                        status: "Err",
                        message: "Something went wrong!",
                        error: err
                    });
                }
                else {
                    res.status(200).json({
                        statusCode: 200,
                        status: "OK",
                        message: "A record has been created sucessfully!"
                    });
                }
            });

        }]);

/**
 * Update existing user
 */
router
    .route("/:id")
    .put([async function (req, res, next) {

        const { id } = req.params;

        let data = req.body;

        var usersRef = ref.child("users");

        var user = usersRef.child(id);

        console.log('FInding user');

        user.update(data, await function (err) {
            if (err) {
                return res.status(300).json({
                    statusCode: 300,
                    status: "Err",
                    message: "Something went wrong!",
                    error: err
                });
            }
            else {
                return res.status(200).json({
                    statusCode: 200,
                    status: "OK",
                    message: "A record has been updated sucessfully!"
                });
            }
        });

    }]);

/**
 * Delete exising user
 */
router
    .route("/:id")
    .delete([function (req, res, next) {

        const { id } = req.params;

        let userRecordRef = ref.child("users/" + id);

        userRecordRef.remove()
            .then(function () {
                console.log("Remove succeeded.");

                return res.status(200).json({
                    statusCode: 200,
                    status: "OK",
                    message: "A record has been removed sucessfully!"
                });

            })
            .catch(function (err) {
                return res.status(300).json({
                    statusCode: 300,
                    status: "Err",
                    message: err.message,
                    error: err
                });
                
                console.log("Remove failed: " + err.message);
            });;

    }]);

module.exports = router;