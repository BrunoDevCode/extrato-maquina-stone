const express = require('express');
const multer = require('multer');
const csvParse = require('csv-parse');
const fs = require('fs');
const { resolve } = require('path');

const upload = multer({ dest: 'tmp/uploads' });

const app = express();

app.use(express.json());

const results = [];
let recived = 0;

app.post('/', upload.single('extract'), (req, res) => {


  const { filename } = req.file;

  console.log('====================')
  console.log(recived);


  fs.createReadStream(resolve(__dirname, '..', 'tmp', 'uploads', `${filename}`))
    .pipe(csvParse())
    .on('data', line => {
      const [, type, value] = line;

      Number(value);

      results.push({
        type,
        value,
      })
    })
    .on('end', () => {
      console.log(results);

      results.map(({ value }) => {

        if (value > 0) {
          recived = value + recived;
        }

      });

      console.log(recived);
      console.log('====================')
    });


  return res.json({ message: 'Hello World' });
});

app.listen(3000);