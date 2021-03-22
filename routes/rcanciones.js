module.exports = (app) => {

    app.get('/canciones', (req,res) => {
        let s;
        req.query.nombre != null ? s = 'Nombre: ' + req.query.nombre + '<br>' : "";
        typeof(req.query.autor) != "undefined" ? s+='Autor: '+req.query.autor : "";
        res.send(s);
    });

    app.get('/suma', (req, res) => res.send(String(parseInt(req.query.num1) + parseInt(req.query.num2))));

    app.get('/canciones/:id', (req, res) => res.send( 'id: ' + req.params.id));

    app.get('/canciones/:genero/:id', (req, res) => res.send('id: ' + req.params.id + '<br>' + 'Género: ' + req.params.genero));
};
