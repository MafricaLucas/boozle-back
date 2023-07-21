const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 82;

// Utiliser express.json avant express.urlencoded
app.use(express.json({ limit: '10mb' }));

app.use('/images', express.static('/images'));

// Appliquer les routes APRES express.json
app.use('/', routes);

// Utiliser express.urlencoded après les routes
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
