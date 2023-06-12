const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require('jsonwebtoken');
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Music school is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster10.dn0f8be.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
// TOTAL COLLECTION HERE.......
    const popularClassCollection = client
      .db("musicSchool")
      .collection("populerClass");

    const instructorsClassCollection = client
      .db("musicSchool")
      .collection("instructors");

    const selectedClassClassCollection = client
      .db("musicSchool")
      .collection("selectedClass");

    const usersClassCollection = client
      .db("musicSchool")
      .collection("users");

      // JWT.........
      app.post("/jwt", (req,res)=>{
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '7d'})
        res.send({token});
      })
      const verifyJWT = (req,res,next) =>{
        const authorization = req.headers.authorization;
        if(!authorization){
          return res.status(401).send({error: true, message: 'unauthorized access'})
        }
        const token = authorization.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
          if(err){
            return res.status(403).send({error: true, message: 'unauthorized access'})
          }
          req.decoded = decoded;
          next(); 
        })
      }
      // users api

      app.get("/users", async(req,res)=>{
        const result = await usersClassCollection.find().toArray();
        res.send(result);
      })

      app.post("/users" , async(req,res)=>{
        const item = req.body;
        const result = await usersClassCollection.insertOne(item);
        res.send(result);
      })

      app.get('/users/admin/:email', verifyJWT, async(req,res)=>{
        const email = req.params.email;
        if(req.decoded.email !== email){
          req.send({admin: false});
        }

        const query = {email: email};
        const user = await usersClassCollection.findOne(query);
        const result = {admin: user?.role === 'admin'}
        res.send(result);
      })

// ADMIN RELATED API....
      app.patch("/users/admin/:id", verifyJWT, async(req,res) =>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updateDoc = {
          $set:{
            role: 'admin'
          }
        }
        const result = await usersClassCollection.updateOne(filter,updateDoc);
        res.send(result);
      })

      app.delete("/users/admin/:id", async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await usersClassCollection.deleteOne(query);
        res.send(result);
      })

    // popular classes get api
    app.get("/populer-class", async (req, res) => {
      const result = await popularClassCollection.find().toArray();
      res.send(result);
    });

    app.post("/populer-class", async(req, res)=>{
      const newItem = req.body;
      const result = await popularClassCollection.insertOne(newItem);
        res.send(result)
    })

    // selected class api
    app.get("/selected-class", verifyJWT, async(req, res)=>{
      const email = req.query.email;
      if(!email){
        res.send([]);
      }

      const decodedEmail = req.decoded.email;
      if(email !== decodedEmail){
        return res.status(403).send({error: true, message: 'unauthorized access'})
      }

      const query = {email: email};
      const result = await selectedClassClassCollection.find(query).toArray();
      res.send(result);
    })

    app.post("/selected-class" , async(req,res)=>{
      const item = req.body;
      const result = await selectedClassClassCollection.insertOne(item);
      res.send(result);
    })

    app.delete("/selected-class/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await selectedClassClassCollection.deleteOne(query);
      res.send(result);
    })
    // instructors get api
    app.get("/instructors", async (req, res) => {
      const result = await instructorsClassCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Music school running on port: ${port}`);
});
