let express = require('express');
let app = express();

let fs = require('fs');
let https = require('https');

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));

let crypto = require('crypto');

let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let swig = require('swig');

let fileUpload = require('express-fileupload');
app.use(fileUpload());

let mongo = require('mongodb');
let dburi = 'mongodb://admin:sdi@tiendamusica-shard-00-00.vadns.mongodb.net:27017,tiendamusica-shard-00-01.vadns.mongodb.net:27017,tiendamusica-shard-00-02.vadns.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-mt8n44-shard-0&authSource=admin&retryWrites=true&w=majority'

let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);



var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});
app.use("/canciones/agregar",routerUsuarioSession);
app.use("/publicaciones",routerUsuarioSession);
app.use("/comentarios",routerUsuarioSession);
app.use("/cancion/comprar",routerUsuarioSession);
app.use("/compras",routerUsuarioSession);

//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
// Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerCanciones(
        {_id: mongo.ObjectID(id) }, function (canciones) {
            console.log(canciones[0]);
            if(canciones[0].autor == req.session.usuario ){
                next();
            } else {
                res.redirect("/tienda");
            }
        })
});
//Aplicar routerUsuarioAutor
app.use("/cancion/modificar",routerUsuarioAutor);
app.use("/cancion/eliminar",routerUsuarioAutor);


let routerAudios = express.Router();
routerAudios.use(function(req, res, next) {
    console.log("routerAudios");
    let path = require('path');
    let idCancion = path.basename(req.originalUrl, '.mp3');
    gestorBD.obtenerCanciones(
        {"_id": mongo.ObjectID(idCancion) }, function (canciones) {
            if(req.session.usuario && canciones[0].autor == req.session.usuario ){
                next();
            } else {
                let criterio = {
                    usuario : req.session.usuario,
                    cancionId : mongo.ObjectID(idCancion)
                };

                gestorBD.obtenerCompras(criterio ,function(compras){
                    if (compras != null && compras.length > 0 ){
                        next();
                    } else {
                        res.redirect("/tienda");
                    }
                });
            }
        })
});
//Aplicar routerAudios
app.use("/audios/",routerAudios);

app.set('db',dburi);
app.set('clave','abcdefg');
app.set('crypto',crypto);
app.set('port',8081);

app.use(express.static('public'));

require("./routes/rusuarios.js")(app,swig,gestorBD); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app,swig,gestorBD);
require("./routes/rcomentarios.js")(app,swig,gestorBD);
require("./routes/rerror.js")(app,swig);
require("./routes/rapicanciones.js")(app, gestorBD);

app.get('/', function (req, res) {
    res.redirect('/tienda');
})

app.use((err,req,res,next) => {
    console.log("Error producido: "+err);
    if(!res.headersSent){
        res.status(400);
        res.redirect("/notavailable");
    }
});

let routerError = express.Router();
routerError.use((req,res,next) => {
    let err = new Error('Not Found');
    err.status = 404;
    res.redirect("/notfound");
});

app.use(routerError);

https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});
