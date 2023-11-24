const express = require('express')
const app = express()
const port = process.env.PORT || 5001
require('dotenv').config()
const cors = require('cors')
const jwt = require('jsonwebtoken')

/* middleware */
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.idkvt6k.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const userCollection = client.db('Bistro_Boss_DB').collection('users');
    const menuCollection = client.db('Bistro_Boss_DB').collection('menu');
    const reviewsCollection = client.db('Bistro_Boss_DB').collection('reviews');
    const cartCollection = client.db('Bistro_Boss_DB').collection('carts');





    /*  jwt post api */
    app.post('/api/v1/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      })
      res.send({ token });
    })


 
    // middleware 
    const verifyToken = (req, res, next) => {
      console.log('inside verify token', req.headers.authorization);
      if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
      })
    }

    /*post User related api */
    app.post('/api/v1/users', async (req, res) => {
      const user = req.body
      const query = { email: user.email, }
      const exitingUser = await userCollection.findOne(query)
      if (exitingUser) {
        return res.send({ messege: "user already exists", insertedId: null })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    // admin api
    /*  jwt post api */
    app.post('/api/v1/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      })
      res.send({ token });
    })

    // admin api
    app.get('/api/v1/users/admin/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log(email);
      if (email !== req.decoded.email) {
        return res.status(403).send({ message: 'unauthorized access' });
      }

      const query = { email: email }; 
      const user = await userCollection.findOne(query);
      let admin = false;

      if (user) {
        admin = user?.role == 'admin';
      }

      res.send({ admin });
    });

    /*get  User related api */
    app.get('/api/v1/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    });

    /* Delete users  */
    app.delete('/api/v1/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result)
    });

    app.patch('/api/v1/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { role: 'admin' },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })


    /* get menu */
    app.get('/api/v1/menus', async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })

    /* get reviews */
    app.get('/api/v1/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })


    /* Post Carts collection */
    app.post('/api/v1/carts', async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result);
    });

    /* Get Carts collection */
    app.get('/api/v1/carts', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });

    /* delete cart to collection  */
    app.delete('/api/v1/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });






    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Bistro boss in running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
/* 
================= NAMING CONVERSIONS =================

1. app.get(/api/v1/reviews)
2. app.get(/api/v1/reviews/:id)
3. app.post(/api/v1/reviews)
4. app.put(/api/v1/reviews/:id)
5. app.patch(/api/v1/reviews/:id)
6 .app.delete(/api/v1/reviews/:id)

*/