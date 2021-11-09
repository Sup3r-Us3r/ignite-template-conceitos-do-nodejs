const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users
    .find(user => user.username === username);

  if (userAlreadyExists) {
    request.username = username;

    return next();
  }

  return response.status(404).json({
    error: 'User not exists!',
  });
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users
    .find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({
      error: 'User already exists!',
    });
  }

  const userData = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(userData);

  return response.status(201).json(userData);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const userTodo = users
    .find(user => user.username === username).todos;

  return response.json(userTodo);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  users
    .find(user => user.username === username)
    .todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;
  const { title, deadline } = request.body;

  const currentTodo = users
    .find(user => user.username === username).todos
    .find(todo => todo.id === id);

  if (!currentTodo) {
    return response.status(404).json({
      error: 'Todo not exists!',
    });
  }

  currentTodo.todos = {
    id: currentTodo.id,
    title,
    done: currentTodo.done,
    deadline: new Date(deadline),
    created_at: currentTodo.created_at,
  };

  return response.json(currentTodo.todos);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const currentTodo = users
    .find(user => user.username === username).todos
    .find(todo => todo.id === id);

  if (!currentTodo) {
    return response.status(404).json({
      error: 'Todo not exists!',
    });
  }

  currentTodo.todos = {
    id: currentTodo.id,
    title: currentTodo.title,
    done: true,
    deadline: currentTodo.deadline,
    created_at: currentTodo.created_at,
  };

  return response.json(currentTodo.todos);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const findUser = users
    .find(user => user.username === username);

  const todoExists = findUser.todos
    .find(todo => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({
      error: 'Todo not exists!',
    });
  }

  const findIndexUserTodo = findUser.todos
    .findIndex(todo => todo.id === id);

  findUser.todos.splice(findIndexUserTodo, 1);

  return response.sendStatus(204);
});

module.exports = app;