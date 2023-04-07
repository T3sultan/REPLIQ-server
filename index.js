const express = require("express");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
// const id = new ObjectId();

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

function verifyJWT(req, res, next) {
  // console.log("abc");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    // console.log(decoded); // bar
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const perliq = client.db("perliq");
    const perliqCollection = perliq.collection("products");
    const orderCollection = perliq.collection("orders");
    const userCollection = perliq.collection("users");

    const verifyAdmin = async (req, res, next) => {
      const requester = req.decoded.email;
      const requesterAccount = await userCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        next();
      } else {
        res.status(403).send({ message: "Forbidden" });
      }
    };
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
    app.get("/user", async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    //user token
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );
      res.send({ result, token });
    });

    /// private make admin
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
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
