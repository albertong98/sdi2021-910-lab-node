module.exports = (app,swig,gestorBD) => {

    app.get('/canciones', (req,res) => res.send(getCanciones(swig)));

    app.get('/suma', (req, res) => res.send(String(parseInt(req.query.num1) + parseInt(req.query.num2))));

    app.get('/canciones/agregar',(req,res) => res.send(agregarCancion(swig)));

    app.get('/canciones/:id', (req, res) => res.send( 'id: ' + req.params.id));

    app.get('/canciones/:genero/:id', (req, res) => res.send('id: ' + req.params.id + '<br>' + 'Género: ' + req.params.genero));

    app.get('/tienda', (req,res) => getTienda(res,req,gestorBD,swig));

    app.get('/cancion/:id', (req,res) => getCancion(req,res,gestorBD,swig));

    app.post('/cancion', (req,res) => postCancion(req,res,gestorBD));
};

let getCancion = (req,res,gestorBD,swig) => {
    let criterio = { "_id" :  gestorBD.mongo.ObjectID(req.params.id) };
    gestorBD.obtenerCanciones(criterio,function(canciones){
        if ( canciones == null ){
            res.send("Error al recuperar la canción.");
        } else {
            let respuesta = swig.renderFile('views/bcancion.html',
                {
                    cancion : canciones[0]
                });
            res.send(respuesta);
        }
    });
}
let getCanciones = swig => {
    let canciones = [
        { "nombre": "Blank space","precio":"1.2"},
        {"nombre": "See you again","precio":"1.3"},
        {"nombre": "Uptown Funk","precio":"1.1"}
    ];
    return swig.renderFile('views/btienda.html',{
        vendedor: 'Tienda canciones',
        canciones : canciones
    });
}

let postCancion = (req,res,gestorBD) =>{
    let cancion = {
        nombre : req.body.nombre,
        genero : req.body.genero,
        precio : req.body.precio
    }
    gestorBD.insertarCancion(cancion, function(id){
        if (id == null) {
            res.send("Error al insertar canción");
        } else {
            if (req.files.portada != null) {
                var imagen = req.files.portada;
                imagen.mv('public/portadas/' + id + '.png', function(err) {
                    if (err) {
                        res.send("Error al subir la portada");
                    } else {
                        if (req.files.audio != null) {
                            let audio = req.files.audio;
                            audio.mv('public/audios/'+id+'.mp3', function(err) {
                                if (err) {
                                    res.send("Error al subir el audio");
                                } else {
                                    res.send("Agregada id: "+ id);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
}

let agregarCancion = swig => {
    return swig.renderFile('views/bagregar.html', {});
}

let getTienda = (res,req,gestorBD,swig) => {
    let criterio = {};
    if( req.query.busqueda != null )
        criterio = { "nombre" : {$regex : ".*"+req.query.busqueda+".*"}  };

    gestorBD.obtenerCanciones( criterio,function(canciones) {
        if (canciones == null) {
            res.send("Error al listar ");
        } else {
            let respuesta = swig.renderFile('views/btienda.html',
                {
                    canciones : canciones
                });
            res.send(respuesta);
        }
    });
}