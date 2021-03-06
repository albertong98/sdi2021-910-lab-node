module.exports = (app,swig,gestorBD) => {

    app.get('/canciones', (req,res) => res.send(getCanciones(swig)));

    app.get('/suma', (req, res) => res.send(String(parseInt(req.query.num1) + parseInt(req.query.num2))));

    app.get('/canciones/agregar',(req,res) => res.send(agregarCancion(req,res,swig)));

    app.get('/canciones/:id', (req, res) => res.send( 'id: ' + req.params.id));

    app.get('/canciones/:genero/:id', (req, res) => res.send('id: ' + req.params.id + '<br>' + 'Género: ' + req.params.genero));

    app.get('/tienda', (req,res) => getTienda(res,req,gestorBD,swig));

    app.get('/cancion/:id', (req,res) => getCancion(req,res,gestorBD,swig));

    app.post('/cancion', (req,res) => postCancion(req,res,gestorBD,swig));

    app.get('/publicaciones', (req,res) => getPublicaciones(req,res,swig,gestorBD));

    app.get('/cancion/modificar/:id', (req,res) => modificarCancion(req,res,gestorBD,swig));

    app.post('/cancion/modificar/:id', (req,res) => postModificarCancion(req,res,gestorBD,swig));

    app.get('/cancion/eliminar/:id',(req,res) => eliminarCancion(req,res,gestorBD,swig));

    app.get('/cancion/comprar/:id',(req,res) => comprarCancion(req,res,gestorBD,swig));

    app.get('/compras', (req,res) => getCompras(req,res,gestorBD,swig));
};

let getCompras = (req,res,gestorBD,swig) => {
    let criterio = { 'usuario' : req.session.usuario };

    gestorBD.obtenerCompras(criterio, (compras) => {
        if(compras == null)
            res.send(swig.renderFile('views/error.html',{error:'error al listar'}));
        else{
            gestorBD.obtenerCanciones( {'_id' : {$in: compras.map(c => c.cancionId) }},(canciones) => {
               res.send(swig.renderFile('views/bcompras.html',{
                   canciones:canciones
               }));
            });
        }
    })
}

let comprarCancion = (req,res,gestorBD,swig) => {
    let cancionId = gestorBD.mongo.ObjectID(req.params.id);
    let compra = {
        usuario : req.session.usuario,
        cancionId : cancionId
    }
    gestorBD.obtenerCanciones({"_id" : cancionId}, canciones => {
        if(canciones[0].autor == req.session.usuario)
            res.redirect("/cancion/"+req.params.id+"?mensaje=El autor de la canción no la puede comprar&tipoMensaje=alert-danger");
        else{
            gestorBD.obtenerCompras({usuario : req.session.usuario, cancionId : cancionId},compras => {
                if(compras != null && compras.length > 0) {
                    res.redirect("/cancion/"+req.params.id+"?mensaje=Ya ha comprado esta canción&tipoMensaje=alert-danger");
                }else {
                    gestorBD.insertarCompra(compra, function (idCompra) {
                        if (idCompra == null) {
                            res.send(swig.renderFile('views/error.html',{error:'Error al comprar canción'}));
                        } else {
                            res.redirect("/compras");
                        }
                    });
                }
            });
        }
    });
}

let eliminarCancion = (req,res,gestorBD,swig) =>{
    let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
    gestorBD.eliminarCancion(criterio,function(canciones){
        if ( canciones == null )
            res.send(swig.renderFile('views/error.html',{error:'error al eliminar la canción '+criterio.toString()}));
        else
            res.redirect("/publicaciones");
    });
}

let modificarCancion = (req,res,gestorBD,swig) => {
    let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };
    gestorBD.obtenerCanciones(criterio,function(canciones){
        if ( canciones == null ){
            res.send(swig.renderFile('views/error.html',{error:'error al modificar la canción '+criterio.toString()}));
        } else {
            let respuesta = swig.renderFile('views/bcancionModificar.html',
                {
                    cancion : canciones[0]
                });
            res.send(respuesta);
        }
    });
}

let postModificarCancion = (req,res,gestorBD,swig) => {
    let id = req.params.id;
    let criterio = { "_id" : gestorBD.mongo.ObjectID(id) };
    let cancion = {
        nombre : req.body.nombre,
        genero : req.body.genero,
        precio : req.body.precio
    }
    gestorBD.modificarCancion(criterio, cancion, function(result) {
        if (result == null) {
            res.send(swig.renderFile('views/error.html',{error:'error al modificar la canción '+id}));
        } else {
            paso1ModificarPortada(req.files, id, function (result) {
                if( result == null){
                    res.send("Error en la modificación");
                } else {
                    res.redirect('/publicaciones');
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
            res.send(swig.renderFile('views/error.html',{error:'error al listar las publicaciones'}));
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
            gestorBD.obtenerCompras({ usuario : req.session.usuario, cancionId : canciones[0]._id},compras => {
                let compra = compras != null && compras.length > 0;
                let criterio = { "cancion_id" : canciones[0]._id }
                gestorBD.obtenerComentarios(criterio,function(comentarios){
                    if(comentarios == null){
                        res.send(swig.renderFile('views/error.html',{error:'error al recuperar los comentarios'}));
                    }else{
                        let configuracion = {
                            url: "https://www.freeforexapi.com/api/live?pairs=EURUSD",
                            method: "get",
                            headers: {
                                "token": "ejemplo",
                            }
                        }
                        let rest = app.get("rest");
                        rest(configuracion, function (error, response, body) {
                            console.log("cod: " + response.statusCode + " Cuerpo :" + body);
                            let objetoRespuesta = JSON.parse(body);
                            let cambioUSD = objetoRespuesta.rates.EURUSD.rate;
                            // nuevo campo "usd"
                            canciones[0].usd = cambioUSD * canciones[0].precio;
                            let respuesta = swig.renderFile('views/bcancion.html',
                                {
                                    cancion : canciones[0],
                                    comentarios : comentarios,
                                    usuario : req.session.usuario,
                                    compra: compra
                                });
                            res.send(respuesta);
                        });
                    }
                });
            });
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

let postCancion = (req,res,gestorBD,swig) =>{
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
            res.send(swig.renderFile('views/error.html',{error:'error al subir la canción '+cancion.nombre}));
        } else {
            if (req.files.portada != null) {
                var imagen = req.files.portada;
                imagen.mv('public/portadas/' + id + '.png', function(err) {
                    if (err) {
                        res.send(swig.renderFile('views/error.html',{error:'error al subir la portada de la cancion '+cancion.nombre}));
                    } else {
                        if (req.files.audio != null) {
                            let audio = req.files.audio;
                            audio.mv('public/audios/'+id+'.mp3', function(err) {
                                if (err) {
                                    res.send(swig.renderFile('views/error.html',{error:'error al subir el audio de la canción '+cancion.nombre}));
                                } else {
                                    res.redirect('/publicaciones');
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

    let pg = parseInt(req.query.pg); // Es String !!!
    if ( req.query.pg == null){ // Puede no venir el param
        pg = 1;
    }
    gestorBD.obtenerCanciones( criterio,function(canciones,total) {
        if (canciones == null) {
            res.send(swig.renderFile('views/error.html',{error:'error al listar'}));
        } else {
            let ultimaPg = total / 4;
            if (total % 4 > 0) { // Sobran decimales
                ultimaPg = ultimaPg + 1;
            }
            let paginas = []; // paginas mostrar
            for (let i = pg - 2; i <= pg + 2; i++) {
                if (i > 0 && i <= ultimaPg) {
                    paginas.push(i);
                }
            }
            let respuesta = swig.renderFile('views/btienda.html',
                {
                    canciones: canciones,
                    paginas: paginas,
                    actual: pg,
                });
            res.send(respuesta);
        }
    });
}