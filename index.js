// express for node
const express = require('express');

// Server Link with Client site data passing permission
const cors = require('cors');

// Browser/Client site access Server environment(.env file) variables
require ('dotenv').config();

// Connection  Server with MDB database and MDB objects
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Server Run in this port
const port = process.env.PORT || 5000;

// app creat for node of express
const app = express();

// middleware
app.use(cors());

// Helps to Transfer with JSON formant  (server database & Clients) among them
app.use(express.json());

// Copy the code from Mongo Connect set user/pass using .env 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yzwpe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// main function working for server 
async function run(){
    try {
        await client.connect();
        // Database Name and Table Name 
        const fruitsCollection = client.db("fruitsHouse").collection("product");

        // Get All Data From Database or MDB
        app.get('/product', async(req, res)=>{
            const query = {};
            const cursor = fruitsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        // Get Single item Data base on item's ID From Database or MDB 
        app.get('/inventory/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await fruitsCollection.findOne(query);
            res.send(product)
        })

        // Add a new item in database 
        app.post('/product', async(req, res)=>{
            const newProduct = req.body;
            const result = await fruitsCollection.insertOne(newProduct);
            res.send(result)
        })



    }
    finally{}
}
run().catch(console.dir)

// main root API & main route run and testing 
app.get('/', (req, res)=>{
    res.send('Server Is Working Now')
});

// This force to run Server to this port
app.listen(port, ()=>{
    console.log('Listening to port', port);
})