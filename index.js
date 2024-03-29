const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Running Pedal");
});

// Verify token

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "Unauthorized Access" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.ACCESS_KEY, (err, decoded) => {
//     if (err) {
//       res.status(403).send({ message: "Forbidded access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }

const uri = `mongodb+srv://pedalPrince179:HltuEkddldj8hBY1@cluster0.clivt.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    console.log("db")
    const productCollection = client.db("pedalPrince").collection("products");
    // Get API
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/myproducts", async (req, res) => {
      const email = req.query.email;
      if (email) {
        const query = { email: email };
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      }
    });
    // Get API by id
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    //Post
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    // DELETE
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          qty: updatedProduct.qty,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // auth JWT
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_KEY, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
  } finally {
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log("Listening to port", port);
});
