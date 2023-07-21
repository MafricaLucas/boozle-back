const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 82;

app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/images', express.static('/images'));

// Appliquer les routes AVANT express.json
app.use('/', routes);

// Utiliser express.json après les routes
app.use(express.json({ limit: '10mb' }));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
