const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());

const version = process.env.APP_VERSION || 'v1';

// The to-dos live here, in the server's memory.
// Restart the server and they are gone. That is deliberate.
let todos = [];
let nextId = 1;

app.get('/api/health', (req, res) => {
res.json({ status: 'ok', version: version });
});

app.get('/api/todos', (req, res) => {
res.json([...todos].reverse());
});

app.post('/api/todos', (req, res) => {
const title = (req.body.title || '').trim();
if (!title) return res.status(400).json({ error: 'Title is required' });
const todo = { id: nextId++, title: title, is_done: false };
todos.push(todo);
res.status(201).json(todo);
});

app.patch('/api/todos/:id', (req, res) => {
const todo = todos.find((t) => t.id === Number(req.params.id));
if (!todo) return res.status(404).json({ error: 'Not found' });
todo.is_done = !todo.is_done;
res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
const before = todos.length;
todos = todos.filter((t) => t.id !== Number(req.params.id));
if (todos.length === before) return res.status(404).json({ error: 'Not found' });
res.status(204).end();
});

const clientDir = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDir));
app.use((req, res) => res.sendFile(path.join(clientDir, 'index.html')));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('App listening on port ' + port));

