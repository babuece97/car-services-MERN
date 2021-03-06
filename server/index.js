const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require ('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

/// MIDDLEWARE
app.use(cors());
app.use(express.json());
function verifyJWT(req,res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'Sorry !!Unauthorized access'});
    }
    const token = authHeader.split(' ') [1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded)=>{
        if(err){
            return res.status (403).send({message:'SorrY FORbiDDEN acceSS'});
        }
        console.log('DecodeD', decoded);
        req.decoded =decoded;
         // console.log('inside Jwt verifies KORCHI',authHeader);
    next();
    })
   

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w1zgr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try {
        await client.connect();
        const serviceCollection =client.db('car-services').collection('services');
        const orderCollection =client.db('car-services').collection('order');

        // AUTH TOKEN
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // TO LOAD ALL DATA for services
        app.get ('/service', async(req,res)=>{
        const query={};
        const cursor =serviceCollection.find(query);
        const services =await cursor.toArray();
        res.send(services);
        })

        // TO LOAD SINGLE DATA
        app.get ('/service/:id', async(req,res)=>{
            const id=req.params.id;
            const query ={_id:ObjectId(id)};
            const service =await serviceCollection.findOne(query);
            res.send(service);
        });

        //POST for adding new service
        app.post('/service',async (req,res)=>{
            const newService =req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        //DELETE
        app.delete('/service/:id', async(req, res)=>{
            const id = req.params.id;
            const query ={_id:ObjectId(id)};
            const result= await serviceCollection.deleteOne(query);
            res.send(result);
        });

        // ORDER COLLECTION api

            // to load the orders in order page
         app.get('/order', verifyJWT, async(req,res)=>{
            const decodedEmail = req.decoded.email;
            const email=req.query.email;
            // console.log(email);
            if (email === decodedEmail) {
            const query={email:email};
            const cursor =orderCollection.find(query); // to load all
            const orders =await cursor.toArray();
            res.send(orders);
            }
            else{
                res.status (403).send({message:'SOrrY!! ForBiden access'})
            }
            
         })

        app.post ('/order', async(req,res)=>{
            const order=req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })


    }
    finally{

    }
}
run().catch(console.dir);



// TO CHK THE connect, we make a API
app.get('/',(req,res)=> {
    res.send('IM running server CARr');

});
app.listen(port,()=>{
    console.log('Listennnn to porrt', port);
})