let express = require('express');
let app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let swig = require('swig');

let mongo = require('mongodb');
let dburi = 'mongodb://admin:sdi@tiendamusica-shard-00-00.vadns.mongodb.net:27017,tiendamusica-shard-00-01.vadns.mongodb.net:27017,tiendamusica-shard-00-02.vadns.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-mt8n44-shard-0&authSource=admin&retryWrites=true&w=majority'

app.set('db',dburi);
app.set('port',8081);

app.use(express.static('public'));

require("./routes/rusuarios.js")(app,swig); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app,swig,mongo);

app.listen(app.get('port'), () => console.log("server activo"));