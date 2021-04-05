module.exports = (app,swig,gestorBD) => {
    app.post('/comentarios/:cancion_id', (req,res) => insertarComentario(req,res,gestorBD,swig));
}

let insertarComentario = (req,res,gestorBD) => {
    let comentario = {
        texto : req.body.texto,
        cancion_id : gestorBD.mongo.ObjectID(req.params.cancion_id),
        autor: req.session.usuario
    }
    gestorBD.insertarComentario(comentario, function(id){
        if (id == null) {
            res.send("Error al insertar comentario");
        } else {
            res.redirect("/cancion/"+comentario.cancion_id.toString());
        }
    });
}