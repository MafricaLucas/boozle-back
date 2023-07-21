const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 82;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/images', express.static('/images'));

app.use('/', routes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
