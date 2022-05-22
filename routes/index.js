const inventory = require('./inventory');

const constructorMethod = (app) =>{
    app.use('/', inventory);
    app.use('*', (req, res) =>{
        res.sendStatus(404);
    })
}

module.exports = constructorMethod;