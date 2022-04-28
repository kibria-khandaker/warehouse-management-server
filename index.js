const express = require('express');
const cors = require('cors');
require ('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// main root API
app.get('/', (req, res)=>{
    res.send('Server Is Working Now')
});

// This force to run to this port
app.listen(port, ()=>{
    console.log('Listening to port', port);
})