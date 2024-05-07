const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 5012;

app.use(bodyParser.json());

// Initialize MongoDB client
const client = new MongoClient('mongodb://localhost:27017/', { useNewUrlParser: true, useUnifiedTopology: true });
let db;

async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        db = client.db('exam');
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

connectToMongoDB();

// Login routes
app.post('/login_student', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.collection('login').findOne({ user: username });
        if (user) {
            if (password === user.password) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(401).json({ success: false, message: "Incorrect password" });
            }
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/login_teacher', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.collection('login').findOne({ user: username });
        if (user) {
            if (password === user.password) {
                return res.status(200).json({ success: true });
            } else {
                return res.status(401).json({ success: false, message: "Incorrect password" });
            }
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Test routes
app.get('/test_names', async (req, res) => {
    try {
        const testNames = await db.collection('test_names').find({}, { projection: { _id: 0, test_name: 1 } }).toArray();
        return res.status(200).json(testNames);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/test_questions', async (req, res) => {
    const testName = req.query.testName;
    try {
        const testCollection = db.collection(testName.replace(' ', '_'));
        const testQuestions = await testCollection.find({}, { _id: 0 }).toArray();
        if (testQuestions.length > 0) {
            return res.status(200).json({ questions: testQuestions });
        } else {
            return res.status(404).json({ message: "Test not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/upload_questions', async (req, res) => {
    const { testName, questions } = req.body;
    try {
        await db.collection('test_names').insertOne({ test_name: testName });
        const collectionName = testName.replace(' ', '_');
        await db.collection(collectionName).insertMany(questions);
        return res.status(200).json({ success: true, message: "Questions uploaded successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Submit answers route
app.post('/submit_answers', async (req, res) => {
    const { answers } = req.body;
    
    try {
        const submittedAnswers = [];
        for (let index = 0; index < answers.length; index++) {
            const question = await db.collection('questions').findOne({ index });
            const correctAnswer = question.correct_answer;
            submittedAnswers.push({ index, answer: answers[index] });
        }
        
        let marks = 0;
        for (const submittedAnswer of submittedAnswers) {
            const { index, answer } = submittedAnswer;
            const correctAnswer = (await db.collection('questions').findOne({ index })).correct_answer;
            if (answer === correctAnswer) {
                marks++;
            }
        }

        return res.status(200).json({ marks });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// Submit test results route
app.post('/submit_test_results', async (req, res) => {
    const { username, marks, questions, cheating, testname } = req.body;

    try {
        const result = await db.collection('results').insertOne({
            username,
            marks,
            questions,
            cheating,
            testname
        });
        
        return res.status(200).json({ success: true, message: "Test results submitted successfully", result_id: result.insertedId });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// View results route
app.get('/view_results', async (req, res) => {
    try {
        const results = await db.collection('results').find().toArray();
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// View results by student ID route
app.get('/view_results_student', async (req, res) => {
    const user_id = req.query.userId;
    
    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const results = await db.collection('results').find({ username: user_id }).toArray();
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
