const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const id = new ObjectId();

const jwt = require("jsonwebtoken");

// ACCESS_TOKEN_SECRET=4e90ca4f3664a3bf8616e78c45eb2c55730058cac3e71a5331484dd1c4000d77a786dbf8b0ef80426aaf02910da366b370dabd3eb6f50ec97a388273d9cebd7d

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mwbsrlv.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const perliq = client.db("perliq");
    const perliqCollection = perliq.collection("products");
    const orderCollection = perliq.collection("orders");

    //service create api
    app.post("/product", async (req, res) => {
      const newParlour = req.body;
      const result = await perliqCollection.insertOne(newParlour);
      res.send(result);
    });
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = perliqCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //product details
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const product = await perliqCollection.findOne(query);
      res.send(product);
    });
    //     checkout
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    //manage service

    //delete api

    //user all

    //user token

    /// private make admin
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("connected REPLIQ");
});
app.listen(port, () => {
  console.log(`REPLIQ server listening on port ${port}`);
});
