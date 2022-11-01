const express = require('express')
const morgan = require("morgan");
const cors = require('cors')
const app = express()

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
//app.use(morgan("tiny"));
app.use(morgan(
    ":method :url :status :res[content-length] - :response-time ms :custom"
));

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    },
]

morgan.token("custom", (request, response) => {
    return "POST" === request.method ? JSON.stringify(request.body) : " ";
});

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'build') });
})

app.get("/info", (request, response) => {
    const numPeople = persons.reduce((counter, person) => {
        if (person.name) counter++;
        return counter;
    }, 0);

    response.send(
        `<p>Phonebook has info for ${numPeople} people</p><p>${new Date()}</p>`
    );
});

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find((person) => person.id === id);

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }

});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);

    response.status(204).end();
});

const generateId = () => {
    return Math.floor(Math.random() * 2500);
};

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "content missing",
            error: "The name or number is missing",
        });
    }
    const personExists = persons.find((person) => person.name === body.name);
    if (personExists) {
        return response.status(400).json({
            error: "The name already exists in the phonebook",
        });
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    };

    console.log(body)
    persons = persons.concat(person);
    response.json(person);
});

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app