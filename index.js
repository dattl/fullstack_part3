require('dotenv').config()

const express = require('express');
const morgan = require('morgan');

const app = express();
const People = require('./models/people.js');



// will need this to handle json
app.use(express.static('dist'))
app.use(express.json());

morgan.token('req_body', function (req, res) {
    return req.body ? JSON.stringify(req.body) : null;
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req_body'));

const PORT = process.env.PORT || 3001;

app.get('/api/persons', (req, res) => {
    People.find({}).then(people => {
        res.json(people)
    });
})

app.get('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    People.findById(id)
        .then(person => {
            if (person) res.json(person);
            else res.status(404).end();
        })
        .catch(err => next(err));
})

app.delete('/api/persons/:id', (req, res, next) => {
    const id = req.params.id;
    People.findByIdAndDelete(id)
        .then(p => {
            if (p) console.log(`deleted ${p.name}`);
            return res.status(204).end();
        })
        .catch(err => next(err));
})

app.get('/info', (req, res, next) => {
    People.countDocuments()
        .then(count => {
            const text = `<p>Phonebook has info for ${count} people</p>
        <p>${new Date(Date.now()).toString()}</p>`;
            res.send(text);
        })
        .catch(err => next(err));
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body;
    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'name or number missing'
        });
    }

    const person = new People({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        res.json(savedPerson);
    }).catch(err => next(err));
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body;

    People.findById(req.params.id)
        .then(person => {
            if (!person) {
                return res.status(404).end();
            }

            person.name = name;
            person.number = number;
            console.log(`Updating ${person.name} with number ${person.number}`);

            return person
                .save()
                .then((updatedPerson) => {
                    res.json(updatedPerson);
                })
                .catch(err => next(err))
        })
        .catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {

    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'malformatted id' })
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});