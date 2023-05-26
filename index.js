const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

// MiddleWire
app.use(cors());
app.use(express.json());

// MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ixy6gu6.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in 
    // await client.connect();

    const allToysCollection = client.db("toyPalaceDB").collection("alltoys");


    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await allToysCollection
        .find({
          $or: [{ name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    //MyToys
    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { SellerEmail: req.query?.email };
      }
      const result = await allToysCollection.find(query).sort({price: 1}).toArray();
      res.send(result);
    });

    // delete data  
    app.delete('/myToys/:id',async(req,res) => {
      const id = req.params.id;
        query = {_id : new ObjectId(id)};
      const result = await allToysCollection.deleteOne(query);
      res.send(result);
    })

    // Update Data 
    app.put('/allToys/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedToy = req.body;
      const toys = {
        $set: {
            name: updatedToy.name,
            img: updatedToy.img,
            price: updatedToy.price,
            rating: updatedToy.rating,
            quantity: updatedToy.quantity,
            category: updatedToy.category,
            description: updatedToy.description
        }
      }
      const result = await allToysCollection.updateOne(filter,toys,options)
      res.send(result)
    })


    //AllToys
    app.get("/allToys", async (req, res) => {
      const result = await allToysCollection.find().toArray();
      res.send(result);
    });

    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToysCollection.findOne(query);
      res.send(result);
    });

    app.get("/marvels", async (req, res) => {
      const query = { category: "marvels" };
      const result = await allToysCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/dc", async (req, res) => {
      const query = { category: "dc" };
      const result = await allToysCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/transformers", async (req, res) => {
      const query = { category: "transformers" };
      const result = await allToysCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/allToys", async (req, res) => {
      const body = req.body;
      const result = await allToysCollection.insertOne(body);
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

app.get("/", (req, res) => {
  res.send("Toy Palace Server Is Ready!!!");
});

app.listen(port, () => {
  console.log(`Your server is running on ${port} port.`);
});
