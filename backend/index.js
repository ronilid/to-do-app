	
// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // For working with the JSON file
const cors = require('cors'); // To enable communication with the frontend

// Initialize the app
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

// Data storage (using a JSON file)
const tasksFilePath = './tasks.json';

// Helper function to read tasks from the JSON file
const readTasks = () => {
    try {
        if (fs.existsSync(tasksFilePath)) {
            const data = fs.readFileSync(tasksFilePath, 'utf-8');
            return data.trim() ? JSON.parse(data) : [];
        }
        return [];
    } catch (error) {
        console.error("Error reading tasks.json:", error);
        return [];
    }
};

// Helper function to save tasks to the JSON file
const writeTasks = (tasks) => {
    try {
        fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
        console.log("Tasks successfully written to file.");
    } catch (error) {
        console.error("Error writing to tasks.json:", error);
    }
};

// Validation Function
const validateTask = (task) => {
    const errors = [];

    if (task.title !== undefined && (!task.title || task.title.trim() === "")) {
        errors.push("Title is required.");
    }

    if (task.priority_id !== undefined && ![1, 2, 3, 4].includes(task.priority_id)) {
        errors.push("Priority must be 1 (Low), 2 (Medium), 3 (High), or 4 (Urgent).");
    }

    if (task.status_id !== undefined && ![1, 2, 3, 4, 5].includes(task.status_id)) {
        errors.push("Status must be 1 (Draft), 2 (In Progress), 3 (On Hold), 4 (Completed), or 5 (Deleted).");
    }

    if (task.due_date !== undefined && isNaN(Date.parse(task.due_date))) {
        errors.push("Due date must be a valid date.");
    }

    return errors;
};

// API Endpoints:
// Get 
app.get('/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// POST 
app.post('/tasks', (req, res) => {
    console.log("Request body received:", req.body);

    const errors = validateTask(req.body);
    if (errors.length > 0) {
        console.error("Validation failed:", errors);
        return res.status(400).json({ message: "Validation failed", errors });
    }

    const newTask = {
        task_id: Date.now(),
        title: req.body.title,
        description: req.body.description || "",
        create_date: new Date().toISOString(),
        due_date: req.body.due_date || null,
        assigned_user_id: req.body.assigned_user_id || 1, // Default to User 1
        priority_id: req.body.priority_id || 1,
        status_id: req.body.status_id || 1,
    };

    console.log("New task being added:", newTask);

    const tasks = readTasks();
    tasks.push(newTask);
    writeTasks(tasks);

    console.log("Task successfully added.");
    res.status(201).json({ message: 'Task added successfully!', task: newTask });
});

// PUT 
app.put('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskId = parseInt(req.params.id);

    if (Object.keys(req.body).length === 0) {
        return res.status(200).json({ message: 'No changes made.' });
    }
    
    const updatedTask = {
        ...req.body,
        update_date: new Date().toISOString(),
    };

    const errors = validateTask(updatedTask);

    if (errors.length > 0) {
        return res.status(400).json({ message: "Validation failed", errors });
    }

    const updatedTasks = tasks.map(task =>
        task.task_id === taskId
            ? {
                  ...task,
                  ...updatedTask,
              }
            : task
    );

    writeTasks(updatedTasks);
    res.json({ message: 'Task updated successfully!' });
});

// Delete 
app.delete('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskId = parseInt(req.params.id);
    const filteredTasks = tasks.filter(task => task.task_id !== taskId);
    writeTasks(filteredTasks);
    res.json({ message: 'Task deleted successfully!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

