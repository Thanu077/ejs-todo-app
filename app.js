// app.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Middleware Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
// Serve static files (CSS)
app.use(express.static(path.join(__dirname))); 

// --- In-Memory Database (Array) ---
let tasks = [
    { id: 1, text: 'Design the responsive layout', priority: 'High', completed: false },
    { id: 2, text: 'Implement EJS templating', priority: 'Medium', completed: true },
    { id: 3, text: 'Set up the Express server', priority: 'Low', completed: false }
];
let nextId = 4; // To assign unique IDs

// --- Routes ---

// GET / - Read (Render List and Filter)
app.get('/', (req, res) => {
    const filter = req.query.priority || 'All';
    let filteredTasks = tasks;

    if (filter !== 'All') {
        filteredTasks = tasks.filter(task => task.priority === filter);
    }

    res.render('index', {
        tasks: filteredTasks,
        currentFilter: filter,
        alertMessage: null // Clear message on page load
    });
});

// POST /add - Create
app.post('/add', (req, res) => {
    const { taskText, priority } = req.body;

    if (!taskText || taskText.trim() === '') {
        // Show alert if input is empty
        return res.render('index', {
            tasks: tasks, // Show all tasks when adding fails
            currentFilter: 'All',
            alertMessage: 'Task description cannot be empty!'
        });
    }

    const newTask = {
        id: nextId++,
        text: taskText.trim(),
        priority: priority,
        completed: false
    };
    tasks.push(newTask);
    res.redirect('/');
});

// POST /toggle/:id - Update (Toggle completion status)
app.post('/toggle/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
    }
    // Redirect back to maintain the current filter
    res.redirect(req.headers.referer || '/');
});

// POST /edit/:id - Update (Edit task text)
app.post('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const newText = req.body.newText;

    if (!newText || newText.trim() === '') {
         // In a production app, we would handle this error more gracefully.
        return res.redirect(req.headers.referer || '/');
    }

    const task = tasks.find(t => t.id === id);
    if (task) {
        task.text = newText.trim();
    }
    res.redirect(req.headers.referer || '/');
});

// POST /delete/:id - Delete
app.post('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = tasks.length;
    
    // Remove the task from the array
    tasks = tasks.filter(t => t.id !== id);
    
    // Redirect back to maintain the current filter
    res.redirect(req.headers.referer || '/');
});


// Start Server
app.listen(port, () => {
    console.log(`Todo App running at http://localhost:${port}`);
});