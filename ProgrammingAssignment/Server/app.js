
const {MongoClient, ObjectId} = require('mongodb');
const express = require('express');
const app = express();
const url = 'mongodb+srv://maheshraju9381:Mongodb@cluster0.svxpsr5.mongodb.net/';
const database = 'Database';
const collectionName = 'Netflix';

app.use(express.json());

// This route reads all the movies from the collection
app.get('/', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true });
  try {
    await client.connect();
    console.log("Successfully connected to mongoDB database");
    const db = client.db(database);
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    res.json(documents);
  } catch (error) {
    console.error('Error:', error);
    // Handle the error by sending an error response
    res.status(500).json({ error: 'An error occurred while fetching data' });
    
  } finally {
    // Close the connection when done
    client.close();
  }

});

//This route reads the movie by title
app.get('/netflix/:title', async (req, res) => {
  let client; // Declare the client variable outside the try block

  try {
    const title = req.params.title;

    // Connect to the MongoDB database
    client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();

    const db = client.db(database);
    const collection = db.collection(collectionName);

    // Find the movie/show document by title
    const document = await collection.findOne({ title: title });

    if (!document) {
      return res.status(404).json({ error: "Movie/show not found" });
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching movie/show details' });
  } finally {
    if (client) {
      client.close();
    }
  }
});

// This route insert the data
app.post('/netflix', async (req, res) => {

  const client = new MongoClient(url, { useNewUrlParser: true });
  try {

    if (Object.keys(req.body).length === 0) {
      console.log("helloooo");
      return res.status(400).json({ error: 'Request body is empty. Please provide a valid JSON request body.' });
    }

    const movieData = req.body;

    await client.connect();
    console.log("Successfully connected to MongoDB database");
    
    const db = client.db(database);
    const collection = db.collection(collectionName);
    const result = await collection.insertOne(movieData);
    res.json({ message: 'Movie added successfully', insertedId: result.insertedId, ProvidedId: movieData.id })
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while adding the movie' });
  } finally {
    client.close();
  }

  //  below is the josn template to instert the movie
  //   {
  //   "title": "New Movie",
  //   "id":"Hello123"
  //   "description": "This is a new movie description.",
  //   "genres": ["Action", "Adventure"],
  //   "imdb_score": "9.0",
  //   "release_year": "2023",
  //   "runtime": "120",
  //   "age_certification": "PG-13",
  //   "production_countries": ["US"],
  //   "type": "MOVIE"
  // }
});

// Below route updates the data by title
app.patch('/netflix/:title', async (req, res) => {
  const client = new MongoClient(url, { useNewUrlParser: true });
  try {
    const title = req.params.title;
    const updatedData = req.body;

    // Ensure that at least one field to update is provided
    if (!Object.keys(updatedData).some(field => ['id', 'title', 'description', 'runtime', 'imdb_score'].includes(field))) {
      return res.status(400).json({ error: "At least one field to update (id, title, description, runtime, imdb_score) must be provided" });
    }

    // Connect to the MongoDB database
    
    await client.connect();

    const db = client.db(database);
    const collection = db.collection(collectionName);

    // Create an update query based on the provided fields
    const updateQuery = {};
    for (const field of ['id', 'title', 'description', 'runtime', 'imdb_score']) {
      if (updatedData.hasOwnProperty(field)) {
        updateQuery[field] = updatedData[field];
      }
    }

    // Find and update the movie/show document by title
    const result = await collection.updateOne({ title: title }, { $set: updateQuery });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Movie/show not found" });
    }

    return res.status(200).json({ message: "Movie/show information updated successfully" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while updating the movie/show information' });
  } finally {
    client.close();
  }
});

//Below route deletes the movie by title
app.delete('/netflix/:title', async (req, res) => {
  let client; // Declare the client variable outside the try block

  try {
    const title = req.params.title;

    // Connect to the MongoDB database
    client = new MongoClient(url, { useNewUrlParser: true });
    await client.connect();

    const db = client.db(database);
    const collection = db.collection(collectionName);

    // Find and delete the movie/show document by title
    const result = await collection.deleteOne({ title: title });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Movie/show not found" });
    }

    return res.status(200).json({ message: "Movie/show information deleted successfully" });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while deleting the movie/show information' });
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.listen(3000, () => {
  console.log(`Server is listening on port 3000`);
});