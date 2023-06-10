const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
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

    // popular classes get api
    app.get("/populer-class", async (req, res) => {
      const result = await popularClassCollection.find().toArray();
      res.send(result);
    });
    // selected class api
    app.post("/selected-class" , async(req,res)=>{
      const item = req.body;
      const result = await selectedClassClassCollection.insertOne(item);
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
