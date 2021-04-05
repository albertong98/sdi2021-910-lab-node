module.exports = (app,swig,gestorBD) => {

    app.get('/canciones', (req,res) => res.send(getCanciones(swig)));

    app.get('/suma', (req, res) => res.send(String(parseInt(req.query.num1) + parseInt(req.query.num2))));

    app.get('/canciones/agregar',(req,res) => res.send(agregarCancion(req,res,swig)));

    app.get('/canciones/:id', (req, res) => res.send( 'id: ' + req.params.id));

    app.get('/canciones/:genero/:id', (req, res) => res.send('id: ' + req.params.id + '<br>' + 'Género: ' + req.params.genero));

    app.get('/tienda', (req,res) => getTienda(res,req,gestorBD,swig));

    app.get('/cancion/:id', (req,res) => getCancion(req,res,gestorBD,swig));

    app.post('/cancion', (req,res) => postCancion(req,res,gestorBD));

    app.get('/publicaciones', (req,res) => getPublicaciones(req,res,swig,gestorBD));

    app.get('/cancion/modificar/:id', (req,res) => modificarCancion(req,res,gestorBD,swig));

    app.post('/cancion/modificar/:id', (req,res) => postModificarCancion(req,res,gestorBD));
};

let modificarCancion = (req,res,gestorBD,swig) => {
    let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
    gestorBD.obtenerCanciones(criterio,function(canciones){
        if ( canciones == null ){
            res.send(respuesta);
        } else {
            let respuesta = swig.renderFile('views/bcancionModificar.html',
                {
                    cancion : canciones[0]
                });
            res.send(respuesta);
        }
    });
}

let postModificarCancion = (req,res,gestorBD) => {
    let id = req.params.id;
    let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
    let cancion = {
        nombre : req.body.nombre,
        genero : req.body.genero,
        precio : req.body.precio
    }
    gestorBD.modificarCancion(criterio, cancion, function(result) {
        if (result == null) {
            res.send("Error al modificar ");
        } else {
            paso1ModificarPortada(req.files, id, function (result) {
                if( result == null){
                    res.send("Error en la modificación");
                } else {
                    res.send("Modificado");
                }
            });
        }
    });
}

function paso1ModificarPortada(files, id, callback){
    if (files && files.portada != null) {
        let imagen =files.portada;
        imagen.mv('public/portadas/' + id + '.png', function(err) {
            if (err) {
                callback(null); // ERROR
            } else {
                paso2ModificarAudio(files, id, callback); // SIGUIENTE
            }
        });
    } else {
        paso2ModificarAudio(files, id, callback); // SIGUIENTE
    }
};

function paso2ModificarAudio(files, id, callback){
    if (files && files.audio != null) {
        let audio = files.audio;
        audio.mv('public/audios/'+id+'.mp3', function(err) {
            if (err) {
                callback(null); // ERROR
            } else {
                callback(true); // FIN
            }
        });
    } else {
        callback(true); // FIN
    }
};

let getPublicaciones = (req,res,swig,gestorBD) => {
    let criterio = { autor : req.session.usuario };
    gestorBD.obtenerCanciones(criterio, function(canciones) {
        if (canciones == null) {
            res.send("Error al listar ");
        } else {
            let respuesta = swig.renderFile('views/bpublicaciones.html',
            {
                canciones : canciones
            });
            res.send(respuesta);
        }
    });
}

let getCancion = (req,res,gestorBD,swig) => {
    let criterio = { "_id" :  gestorBD.mongo.ObjectID(req.params.id) };
    gestorBD.obtenerCanciones(criterio,function(canciones){
        if ( canciones == null ){
            res.send("Error al recuperar la canción.");
        } else {
            let criterio = { "cancion_id" : canciones[0]._id }
            gestorBD.obtenerComentarios(criterio,function(comentarios){
                if(comentarios == null){
                    res.send("Error al recuperar los comentarios.");
                }else{
                    let respuesta = swig.renderFile('views/bcancion.html',
                        {
                            cancion : canciones[0],
                            comentarios : comentarios
                        });
                    res.send(respuesta);
                }
            })
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
    if ( req.session.usuario == null){
        res.redirect("/tienda");
        return;
    }

    let cancion = {
        nombre : req.body.nombre,
        genero : req.body.genero,
        precio : req.body.precio,
        autor: req.session.usuario
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

let agregarCancion = (req,res,swig) => {
    if ( req.session.usuario == null){
        res.redirect("/tienda");
        return;
    }
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