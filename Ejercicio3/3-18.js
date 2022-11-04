require('dotenv').config()
const express = require('express')
const morgan = require("morgan");
const cors = require('cors')
const Person = require('./models/person')

const path = require('path');
const app = express()


app.use(express.static('build'))
app.use(cors())
app.use(express.json())

//app.use(morgan("tiny"));
app.use(morgan(
    ":method :url :status :res[content-length] - :response-time ms :custom"
));

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
    Person.find({}).then(persons => {
        response.json(persons);
    })
});

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

const generateId = () => {
    return Math.floor(Math.random() * 2500);
};

app.post("/api/persons", (request, response, next) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "content missing"
        });
    }

    const person = new Person({
        name: body.name,
        number: body.number,
        id: generateId(),
    });

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

module.exports = app