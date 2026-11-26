import express from "express";
import cors from "cors";
import "dotenv/config";
import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(
  `mongodb://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@ac-2zvfuqn-shard-00-00.ndpwr4v.mongodb.net:27017,ac-2zvfuqn-shard-00-01.ndpwr4v.mongodb.net:27017,ac-2zvfuqn-shard-00-02.ndpwr4v.mongodb.net:27017/?ssl=true&replicaSet=atlas-p2n9ts-shard-0&authSource=admin`,
);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

async function startServer() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    const database = client.db("jobSphere");
    const users = database.collection("user");
    const jobs = database.collection("jobs");

    app.get("/", (req, res) => {
      res.send("JobSphere app is running fine!");
    });

    // Get all users
    // Get all users
    app.get("/users", async (req, res) => {
      try {
        const result = await users.find({}).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to get users" });
      }
    });

    // Get all jobs
    app.get("/jobs", async (req, res) => {
      try {
        const result = await jobs.find({}).sort({ _id: 1 }).toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to get jobs" });
      }
    });

    // Create a job
    app.post("/jobs", async (req, res) => {
      try {
        const job = req.body;
        const result = await jobs.insertOne(job);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to create job" });
      }
    });

    // Delete a job
    app.delete("/jobs/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid job ID",
          });
        }

        const result = await jobs.deleteOne({
          _id: new ObjectId(id),
        });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            message: "Job not found",
          });
        }

        res.send({
          message: "Job deleted successfully",
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        console.error("Delete job error:", error);

        res.status(500).send({
          message: "Failed to delete job",
          error: error.message,
        });
      }
    });

    // Update a job
    app.patch("/jobs/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            message: "Invalid job ID",
          });
        }

        const {
          title,
          company,
          category,
          Type,
          isRemote,
          location,
          minSalary,
          maxSalary,
          salaryFrequency,
          responsibilities,
          requirements,
          status,
          deadline,
        } = req.body;

        const updatedData = {
          title,
          company,
          category,
          Type,
          isRemote,
          location,
          minSalary,
          maxSalary,
          salaryFrequency,
          responsibilities,
          requirements,
          status,
          deadline,
        };

        // Remove undefined fields
        Object.keys(updatedData).forEach((key) => {
          if (updatedData[key] === undefined) {
            delete updatedData[key];
          }
        });

        const result = await jobs.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData },
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            message: "Job not found",
          });
        }

        res.send({
          message: "Job updated successfully",
          result,
        });
      } catch (error) {
        console.error("Update job error:", error);

        res.status(500).send({
          message: "Failed to update job",
          error: error.message,
        });
      }
    });

    // Start server after MongoDB connects
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`JobSphere app listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
