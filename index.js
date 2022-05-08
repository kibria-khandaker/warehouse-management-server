// express for node
const express = require('express');

// Server Link with Client site data passing permission
const cors = require('cors');

// Require For make jsonwebtoken 
const jwt = require('jsonwebtoken');

// Browser/Client site access Server environment(.env file) variables
require('dotenv').config();

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
async function run() {
    try {

        await client.connect();
        // Database Name and Table Name 
        const fruitsCollection = client.db("fruitsHouse").collection("product");

        app.post('/login', (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            // console.log(email, token);
            res.send({ token })
        })

        // Get All Data From Database or MDB
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = fruitsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        })

        // Get Single item Data base on item's ID From Database or MDB 
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await fruitsCollection.findOne(query);
            res.send(product)
        })

        // Add a new item in database 
        app.post('/product', async (req, res) => {
            const newProduct = req.body;

            // const result = await fruitsCollection.insertOne(newProduct);
            // res.send(result)

            // verify JWT token start ---------
            const tokenHeader = req.headers.authorization;
            // console.log(tokenHeader);
            const [email, accessToken] = tokenHeader.split(" ")
            // console.log(email, accessToken);
            // const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            const decoded = verifyJwToken(accessToken)
            // console.log(decoded);
            // verify JWT token end --
            if (email === decoded.email) {
                const result = await fruitsCollection.insertOne(newProduct);
                // res.send(result)
                res.send({ success: 'Thanks, Your Item Successfully Added', result, product: newProduct })
            } else {
                res.send({ success: 'Your are UnAuthorized, Bro..! ' })
            }
            // verify JWT token end ---------
        })

        // DELETE items from database & UI
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitsCollection.deleteOne(query);
            res.send(result);
        })

        // Update items ----
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const updateStockNumber = req.body;
            // console.log(updateStockNumber, id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    inStock: updateStockNumber.inStock,
                },
            };
            const result = await fruitsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
            console.log(updateDoc);
        })

        // User get data (product/inventory-items/user-items) filtering by Email
        app.get('/myitems', async (req, res) => {    
            //--------- iam trying but for token not working -str
            const tokenHeader = req.headers.authorization;
            if (!tokenHeader){
                res.send({ success: 'You are unauthorized to Access' })
            }else {
                const [email, accessToken] = tokenHeader.split(" ")
                const decoded = verifyJwToken(accessToken)
                if (email === decoded.email) {
                    const myitem = await fruitsCollection.find({ email: email }).toArray();
                    res.send(myitem)
                } else {
                    res.send({ success: 'Your are UnAuthorized, Bro..! ' })
                }
            }
            //--------- for token not working -end
        })
        //-------------- end all API
    }
    finally { }
}
run().catch(console.dir)

// main root API & main route run and testing 
app.get('/', (req, res) => {
    res.send('Server Is Working Now')
});

// This force to run Server to this port
app.listen(port, () => {
    console.log('Listening to port', port);
})

// function Verify for user's Token/email ---
function verifyJwToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {

        if (err) {
            email = 'Invalid email'
        }
        if (decoded) {
            console.log(decoded)
            email = decoded
        }
    });
    return email;
}
