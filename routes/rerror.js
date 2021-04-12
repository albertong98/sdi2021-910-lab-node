module.exports = (app,swig) => {
    app.get("/notfound", (req,res) => notFound(swig,res));

    app.get("/notavaliable",(req,res) => notAvailable(swig,res));
}

let notFound = (swig,res) => {
    res.send(swig.renderFile('views/error.html',{error : '404 - Página no encontrada'}));
}

let notAvailable = (swig,res) => {
    res.send(swig.renderFile('views/error.html',{error : '400 - Recurso no disponible'}));
}