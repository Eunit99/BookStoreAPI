var _data = require('./fileUtil');
var helper = require('./helper');

var userHandler = {}

userHandler.users = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        userHandler._users[data.method](data, callback);
    } else {
        callback(405);
    }
};

userHandler._users = {};

//Required data: firstName, lastName, email, password
userHandler._users.post = (data, callback) => {
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (firstName && lastName && email && password) {
        _data.read('users', email, (err, data) => {
            if (err) {
                var hashedPassword = helper.hash(password);

                if (hashedPassword) {
                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        'email': email,
                        'hashedPassword': hashedPassword
                    };

                    _data.create('users', email, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'could not create new user' })
                        }
                    });
                } else {
                    callback(500, { 'Error': 'could not create user password' })
                }

            } else {
                callback(400, { 'Error': 'A user with this email already exists' });
            }
        });
    } else {
        callback(400, { 'Error': 'missing required fields' });
    }
};

//Required data: email
userHandler._users.get = (data, callback) => {
    var email = typeof(data.query.email) == 'string' && data.query.email.trim().length > 0 ? data.query.email.trim() : false;

    if (email) {
        var token = typeof(data.header.token) == 'string' ? data.header.token : false;
        userHandler._tokens.verifyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                _data.read('users', email, (err, data) => {
                    if (!err && data) {
                        delete data.hashedPassword;
                        callback(200, data);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(403, { 'Error': 'Missing required token in header or invalid token' })
            }
        });
    } else {
        calback(400, { 'Error': 'Missing required fields' })
    }
};

userHandler._users.put = (data, callback) => {
    //Required field
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (email) {
        if (firstName || lastName || password) {
            _data.read('users', email, (err, userObject) => {
                if (!err && userObject) {
                    if (firstName) {
                        userObject.firstName = firstName;
                    }
                    if (lastName) {
                        userObject.lastName = lastName;
                    }
                    if (password) {
                        userObject.hashedPassword = helper.hash(password);
                    }

                    _data.update('users', email, userObject, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            console.log(err);
                            callback(500, { 'Error': 'could not update the user' });
                        }
                    });
                } else {
                    callback(400, { 'Error': 'the specified user does not exist' });
                }
            })
        } else {
            callback(400, { 'Error': 'missing fields to update' })
        }
    } else {
        callback(400, { 'Error': 'missing required field' });
    }
};

userHandler._users.delete = (data, callback) => {
    var email = typeof(data.query.email) == 'string' && data.query.email.trim().length > 0 ? data.query.email.trim() : false;

    if (email) {
        _data.read('users', email, (err, data) => {
            if (!err && data) {
                _data.delete('users', email, (err) => {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, { 'Error': 'could not delete the specified user' })
                    }
                });
            } else {
                callback(400, { 'Error': 'User cannot be found' });
            }
        });
    } else {
        calback(400, { 'Error': 'Missing required fields' })
    }
};

//Tokens
userHandler.tokens = (data, callback) => {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        userHandler._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

userHandler._tokens = {};

//Required data - email and password
userHandler._tokens.post = (data, callback) => {
    var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (email && password) {
        _data.read('users', email, (err, userObject) => {
            if (!err && userObject) {
                var hashedPassword = helper.hash(password);
                if (hashedPassword == userObject.hashedPassword) {
                    var tokenId = helper.generateRandomString(20);
                    var expires = Date.now() + 1000 * 60 * 60;
                    var tokenObject = {
                        'email': email,
                        'id': tokenId,
                        'expires': expires
                    };

                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, { 'Error': 'could not create the token' })
                        }
                    });
                } else {
                    callback(400, { 'Error': 'incorrect password' });
                }
            } else {
                callback(400, { 'Error': 'could not find specified user' })
            }
        })
    } else {
        callback(400, { 'Error': 'missing required fields' });
    }
};

userHandler._tokens.get = (data, callback) => {
    var id = typeof(data.query.id) == 'string' && data.query.id.trim().length > 0 ? data.query.id.trim() : false;

    if (id) {
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        calback(400, { 'Error': 'Missing required fields' })
    }
};

userHandler._tokens.delete = (data, callback) => {
    var id = typeof(data.query.id) == 'string' && data.query.id.trim().length > 0 ? data.query.id.trim() : false;

    if (id) {
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, { 'Error': 'could not delete the specified user' })
                    }
                });
            } else {
                callback(400, { 'Error': 'User cannot be found' });
            }
        });
    } else {
        calback(400, { 'Error': 'Missing required fields' })
    }
};

//Verify user token
userHandler._tokens.verifyToken = (id, email, callback) => {
    _data.read('tokens', id, (err, tokenObject) => {
        if (!err && tokenObject) {
            if (tokenObject.email == email && tokenObject.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
}

module.exports = userHandler;