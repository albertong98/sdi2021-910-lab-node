module.exports = (app,swig,gestorBD) => {

    app.get('/canciones', (req,res) => res.send(getCanciones(swig)));

    app.get('/suma', (req, res) => res.send(String(parseInt(req.query.num1) + parseInt(req.query.num2))));

    app.get('/canciones/agregar',(req,res) => res.send(agregarCancion(swig)));

    app.get('/canciones/:id', (req, res) => res.send( 'id: ' + req.params.id));

    app.get('/canciones/:genero/:id', (req, res) => res.send('id: ' + req.params.id + '<br>' + 'Género: ' + req.params.genero));

    app.post('/cancion',(req,res) => postCancion(req,res));
};

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

let postCancion = (req,res) =>{
    let cancion = {
        nombre : req.body.nombre,
        genero : req.body.genero,
        precio : req.body.precio
    }
    gestorBD.insertarCancion(cancion, function(id){
        if (id == null) {
            res.send("Error al insertar canción");
        } else {
            res.send("Agregada la canción ID: " + id);
        }
    });
}

let agregarCancion = swig => {
    return swig.renderFile('views/bagregar.html', {});
}