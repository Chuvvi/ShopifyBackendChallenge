const express = require('express');
const app = express();
const configRoutes = require('./routes');
const static = express.static(__dirname + '/public');
const exphbs = require('express-handlebars');

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    helpers: {
        asJSON: (obj, spacing) =>{
            if(typeof spacing == 'number') return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
            return new Handlebars.SafeString(JSON.stringify(obj));
        }
    }
});

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    if (req.body && req.body._method) {
      req.method = req.body._method;
      delete req.body._method;
    }
    next();
};

app.use;
app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});


// const {inventory, warehouse} = require('./data');

// async function main(){
//   try{
//     let params = {
//       name: 'C',
//       location: 'Jersey City',
//       capacity: '250'
//     }
//     let p = {
//       title: 'B',
//       description: 'Something',
//       cost: '100',
//       stock: '1000',
//       weight: '1'
//     }
//     // let res = await warehouse.create(params);
//     // let res = await warehouse.returnBack('62882292c12cc4b58379738f','62882245d51fce1ab651ec19', '10');
//     // let res = await inventory.create(p);
//     // let res = await warehouse.addItem('62899100a380816cf243df29', '628990d5bc4993d3ee801122', '30');
//     // let res = await inventory.remove('6289770cfaea56290200744d');
//     console.log(res);
//   }
//   catch (e){
//     console.log(e);
//   }
// }

// main();