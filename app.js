let express = require('express');
let app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let swig = require('swig');

let fileUpload = require('express-fileupload');
app.use(fileUpload());

let mongo = require('mongodb');
let dburi = 'mongodb://admin:sdi@tiendamusica-shard-00-00.vadns.mongodb.net:27017,tiendamusica-shard-00-01.vadns.mongodb.net:27017,tiendamusica-shard-00-02.vadns.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-mt8n44-shard-0&authSource=admin&retryWrites=true&w=majority'

app.set('db',dburi);

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

app.set('port',8081);

app.use(express.static('public'));

require("./routes/rusuarios.js")(app,swig,gestorBD); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app,swig,gestorBD);

app.listen(app.get('port'), () => console.log("server activo"));