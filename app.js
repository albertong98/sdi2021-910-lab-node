let express = require('express');
let app = express();

app.set('port',8081);

require("./routes/rusuarios.js")(app); // (app, param1, param2, etc.)
require("./routes/rcanciones.js")(app);

app.listen(app.get('port'), () => console.log("server activo"));