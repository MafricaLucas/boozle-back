const express = require('express');
const routes = require('./routes');
var cors = require('cors');

var corsOptions = {
    origin: 'http://51.255.50.74:86', // replace with the URL of your frontend
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
const port = process.env.PORT || 82;

// Utiliser express.json avant express.urlencoded
app.use(express.json({ limit: '10mb' }));

app.use('/images', express.static('/images'));

app.use(cors(corsOptions));
// Appliquer les routes APRES express.json
app.use('/', routes);

// Utiliser express.urlencoded après les routes
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
