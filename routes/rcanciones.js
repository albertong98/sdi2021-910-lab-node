module.exports = (app) => {

    app.get('/canciones', (req,res) => res.send(getCancion(req)));

    app.get('/suma', (req, res) => res.send(String(parseInt(req.query.num1) + parseInt(req.query.num2))));

    app.get('/canciones/:id', (req, res) => res.send( 'id: ' + req.params.id));

    app.get('/canciones/:genero/:id', (req, res) => res.send('id: ' + req.params.id + '<br>' + 'Género: ' + req.params.genero));

    app.post('/cancion',(req,res) => res.send(postCancion(req)));
};

let getCancion = req => {
    let res = req.query.nombre != null ? 'Nombre: ' + req.query.nombre + '<br>' : "";
    typeof(req.query.autor) != "undefined" ? res+='Autor: '+req.query.autor : "";
    return res;
}

let postCancion = req => 'Canción agregada '+req.body.nombre+'<br>'+'Genero: '+req.body.genero+'<br>'+'precio: '+req.body.precio
