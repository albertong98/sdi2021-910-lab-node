let express = require('express');
let app = express();

app.set('port',8081);

app.get('/usuarios',(req,res) => {
    console.log();
    res.send("ver usuarios");
});

app.get('/canciones',(req,res) => res.send("ver canciones"));

app.listen(app.get('port'), () => console.log("server activo"));