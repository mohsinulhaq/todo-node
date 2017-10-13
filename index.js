const express = require('express');
const mongoose = require('mongoose');
const redis = require("redis");
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
mongoose.Promise = global.Promise;

const app = express();
const rds = redis.createClient(process.env.REDIS_URL);
const db = mongoose.model('todo', mongoose.Schema({todo: String, done: Boolean}));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/api', (req, res) => {
    db.find((err, todos) => {
        if (err) res.send(err);

        res.json(todos);
    });
});

app.post('/api', (req, res) => {
    db.create({
        todo: req.body.todo,
        done: false
    }, (err) => {
        if (err) res.send(err);

        db.find((err, todos) => {
            if (err) res.send(err);

            res.json(todos);
        });
    });
});

app.put('/api/:todo_id', (req, res) => {
    db.update({
        _id: req.params.todo_id
    }, {
        done: req.body.action === 'done'
    }, (err) => {
        if (err) res.send(err);

        db.find((err, todos) => {
            if (err) res.send(err);

            res.json(todos);
        });
    });
});

app.delete('/api/:todo_id', (req, res) => {
    db.remove({
        _id: req.params.todo_id
    }, (err) => {
        if (err) res.send(err);

        db.find((err, todos) => {
            if (err) res.send(err);

            res.json(todos);
        });
    });
});

app.listen(process.env.PORT);
