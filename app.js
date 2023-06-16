const express = require('express');
const { connectToDb, getDb } = require('./mondb');
const fs = require('fs');
const readline = require('readline');
const { normal } = require('./normal');
const { test } = require('./test');


const app = express();
app.use(express.json());
app.use(express.text());

const port = 3030;

let mondb;

connectToDb((err) => {
  if (!err) {
      app.listen(port, () => {
          console.log(`app listening on port ${port}`);
      });
      mondb = getDb();
  }
})
  
  app.post('/api/collection', (req, res) => {
    const wordsArray = [];
  
    const readStream = fs.createReadStream('words_alpha.txt');
    const rl = readline.createInterface({
      input: readStream,
      output: process.stdout,
      terminal: false
    });
  
    rl.on('line', (word) => {
      wordsArray.push({ word: word });
    });
  
    rl.on('close', () => {
      mondb.collection('web')
        .insertMany(wordsArray)
        .then((result) => {
          res.status(201).json(result);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ err: 'Could not create new documents.' });
        });
    });
  });

  app.get('/api/search', (req, res) => {
    let searchWord = req.query.w;
      mondb.collection('web')
      .findOne({word: `${searchWord}`})
      .then((doc) => {
        if (doc) {
            res.status(200).json({response: `${searchWord} word is found`});
          } else {
            res.status(404).json({ error: 'No matching word is found' });
          }
      })
      .catch((err) => {
        res.status(500).json({error: 'Could not fetch the document'})
      })
  })

  app.post('/api/normalize', (req, res) => {
    const word = req.body;
    const resWord = normal(word);
    res.send(`
        Sent word: ${word}
        Normilized word: ${resWord}
    `);
  });

  app.get('/api/test', (req, res) => {
    const words = [
        'Washes', 'Ganges', 'Busses', 'Cups', 'Sho%$#@es',
        'Boys', 'Rays', 'Wolv@#$%es', 'Cups',
        'Max', 'Womens', 'Radios', 'kis$#&^ses',
        'Quizzes', 'Watches', 'Boxes', 'Heroes'
    ];
    const result = test(words);
    res.send(`
        Words for testing: 
        ${words}
        Results: 
        ${result}
    `);
  });