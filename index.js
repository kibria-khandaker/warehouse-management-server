const express = require('express');
const cors = require('cors');
require ('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// Copy the code from Mongo Connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yzwpe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        await client.connect();
        const fruitsCollection = client.db("fruitsHouse").collection("product");
        app.get('/product', async(req, res)=>{
            const query = {};
            const cursor = fruitsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        app.get('/inventory/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await fruitsCollection.findOne(query);

            res.send(product)
        })






    }
    finally{}
}
run().catch(console.dir)

// main root API
app.get('/', (req, res)=>{
    res.send('Server Is Working Now')
});

// This force to run to this port
app.listen(port, ()=>{
    console.log('Listening to port', port);
})