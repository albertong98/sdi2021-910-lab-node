module.exports = (app,swig,gestorBD) => {
    app.get('/usuarios', (req, res) => res.send("ver usuarios"));

    app.post('/usuario', (req,res) => postUsuario(app,req,res,gestorBD));

    app.get("/identificarse", (req,res) => getLogin(res,swig));

    app.post("/identificarse", (req,res) => identificarUsuario(app,req,res,gestorBD));

    app.get('/desconectarse', (req,res) => logout(req,res));

    app.get('/registrarse',(req,res) => getSignUp(res,swig))

}

let getSignUp = (res,swig) => {
    let respuesta = swig.renderFile('views/bregistro.html', {});
    res.send(respuesta);
}

let logout = (req,res) => {
    req.session.usuario = null;
    res.send("Usuario desconectado");
}

let getLogin = (res,swig) => {
    let respuesta = swig.renderFile('views/bidentificacion.html', {});
    res.send(respuesta);
}

let identificarUsuario = (app,req,res,gestorBD) => {
    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');
    let criterio = {
        email : req.body.email,
        password : seguro
    }
    gestorBD.obtenerUsuarios(criterio, function(usuarios) {
        if (usuarios == null || usuarios.length == 0) {
            req.session.usuario = null;
            res.send("No identificado: ");
        } else {
            req.session.usuario = usuarios[0].email;
            res.redirect("/publicaciones");
        }
    });
}
let postUsuario = (app,req,res,gestorBD) => {
    let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
        .update(req.body.password).digest('hex');
    let usuario = {
        email : req.body.email,
        password : seguro
    }
    gestorBD.insertarUsuario(usuario, function(id) {
        if (id == null){
            res.send("Error al insertar el usuario");
        } else {
            res.redirect('/identificarse');
        }
    });

}