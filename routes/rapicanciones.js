module.exports = (app,gestorBD) => {
    app.get('/api/cancion',(req,res) => obtenerCanciones(res,gestorBD));

    app.get('/api/cancion/:id',(req,res) => obtenerCancion(req,res,gestorBD));

    app.delete('/api/cancion/:id',(req,res) => borrarCancion(req,res,gestorBD));

    app.post('/api/cancion',(req,res) => agregarCancion(req,res,gestorBD));

    app.put('/api/cancion/:id',(req,res) => modificarCancion(req,res,gestorBD));

    app.post('/api/autenticar/',(req,res) => autenticarUsuario(req,res,gestorBD));
}

let obtenerCanciones = (res,gestorBD) => {
    gestorBD.obtenerCanciones( {} , function(canciones) {
        if (canciones == null) {
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones) );
        }
    });
}


let obtenerCancion = (req,res,gestorBD) => {
    let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

    gestorBD.obtenerCanciones(criterio,function(canciones){
        if ( canciones == null ){
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones[0]) );
        }
    });
}

let borrarCancion = (req,res,gestorBD) => {
    let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

    gestorBD.eliminarCancion(criterio,function(canciones){
        if ( canciones == null ){
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.send( JSON.stringify(canciones) );
        }
    });
}

let agregarCancion = (req,res,gestorBD) => {
    let cancion = {
        nombre : req.body.nombre,
        genero : req.body.genero,
        precio : req.body.precio,
    }
    // ¿Validar nombre, genero, precio?

    gestorBD.insertarCancion(cancion, function(id){
        if (id == null) {
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(201);
            res.json({
                mensaje : "canción insertada",
                _id : id
            })
        }
    });
}

let modificarCancion = (req,res,gestorBD) => {
    let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

    let cancion = {}; // Solo los atributos a modificar
    if ( req.body.nombre != null)
        cancion.nombre = req.body.nombre;
    if ( req.body.genero != null)
        cancion.genero = req.body.genero;
    if ( req.body.precio != null)
        cancion.precio = req.body.precio;
    gestorBD.modificarCancion(criterio, cancion, function(result) {
        if (result == null) {
            res.status(500);
            res.json({
                error : "se ha producido un error"
            })
        } else {
            res.status(200);
            res.json({
                mensaje : "canción modificada",
                _id : req.params.id
            })
        }
    });
}

let autenticarUsuario = (req,res,gestorBD) => {
    let seguro = app.get('crypto').createHmac('sha356',app.get('clave')).update(req.body.password).digest('hex');

    let criterio = { email: req.body.email, password: seguro };

    gestorBD.obtenerUsuarios(criterio, (usuarios) => {
       if(usuarios == null || usuarios.length == 0){
           res.status(401);
           res.json({ autenticado: false });
       }else{
           let token = app.get('jwt').sign(
               {usuario: criterio.email , tiempo: Date.now()/1000},
               "secreto");
           res.status(200);
           res.json({
               autenticado: true,
               token : token
           });
       }
    });
}