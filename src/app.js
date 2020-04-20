const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];


function validateId (request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({error: "Invalid repository ID."})
  }

  next();
}

function findRepositoryIndex (request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => (repository.id === id))

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Repository not found."})
  }
  
  request.headers['x-repository-index'] = repositoryIndex;
  next();
}

app.use('/repositories/:id', validateId, findRepositoryIndex);

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  
  const repository = {
    id: uuid(),
    title, 
    url, 
    techs, 
    likes: 0
  }

  repositories.push(repository);

  return response.status(201).json(repository)
});

app.put("/repositories/:id", (request, response) => {
  const repositoryIndex = request.headers['x-repository-index'];

  ['title', 'url', 'techs'].forEach(property => {
    if (request.body[property]) {
      repositories[repositoryIndex][property] = request.body[property]
    }
  })

  return response.json(repositories[repositoryIndex])
});

app.delete("/repositories/:id", (request, response) => {
  const repositoryIndex = request.headers['x-repository-index'];
  repositories.splice(repositoryIndex, 1)
  return response.status(204).send()
});

app.post("/repositories/:id/like", (request, response) => {
  const repositoryIndex = request.headers['x-repository-index'];
  repositories[repositoryIndex].likes++
  return response.status(201).json(repositories[repositoryIndex])
});

module.exports = app;
