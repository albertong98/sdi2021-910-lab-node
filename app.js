let express = require('express');
let app = express();

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let swig = require('swig');

app.set('port',8081);

app.use(express.static('public'));

require("./routes/rusuarios.js")(app,swig); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app,swig);

app.listen(app.get('port'), () => console.log("server activo"));