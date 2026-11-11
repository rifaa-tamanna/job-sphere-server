import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { MongoClient } from 'mongodb';

const client = new MongoClient(`mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@ac-2zvfuqn-shard-00-00.ndpwr4v.mongodb.net:27017,ac-2zvfuqn-shard-00-01.ndpwr4v.mongodb.net:27017,ac-2zvfuqn-shard-00-02.ndpwr4v.mongodb.net:27017/?ssl=true&replicaSet=atlas-p2n9ts-shard-0&authSource=admin`);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient = await connectToMongoDB()

//database collection create
const database = connectedClient.db('jobSphere');
const users = database.collection('user');
const jobs = database.collection('jobs');


const app = express()
const PORT = process.env.PORT || 5000

// middleware
app.use(express.json())
app.use(cors())



app.get('/', (req, res) => {
    res.send('JobSphere app is running fine!')
})

// all users get
app.get('/users' , async(req, res) => {
    const result = await users.find({}).toArray()
    res.send(result)
})


app.listen(PORT, () => {
    console.log(`JobSphere app listening on port ${PORT}`)
})






