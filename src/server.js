const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse');
const fs = require('fs');
const { resolve } = require('path');

const upload = multer({ dest: 'tmp/uploads' });

const app = express();

app.use(express.json());

app.post('/', upload.single('extract'), (req, res) => {
  const { bank } = req.body

  const results = [];

  const { filename } = req.file;

  fs.createReadStream(resolve(__dirname, '..', 'tmp', 'uploads', `${filename}`))
    .pipe(parse({ delimiter: ';' }))
    .on('data', line => {
      if (bank === 'inter') {
        let [date, history, description, value] = line;

        results.push({
          date,
          history,
          description,
          amount: parseFloat(value.replace('.', '')),
        });
      }

      if (bank === 'stone') {
        let [, , value, , , , date, situation] = line;

        results.push({
          situation,
          amount: parseFloat(value.replace('.', '')),
          date,
        });
      }
    })
    .on('end', async () => {

      const received = results.reduce((acc, operation) => {
        if (operation.amount > 0) {
          acc += operation.amount
        }
        return acc
      }, 0)

      const send = results.reduce((acc, operation) => {
        if (operation.amount < 0) {
          acc += operation.amount
        }

        return acc
      }, 0)

      await fs.promises.unlink(resolve(__dirname, '..', 'tmp', 'uploads', `${filename}`));

      const total = received - (-send);

      if (total > 0) {
        situation = 'Lucro';
      } else {
        situation = 'Prejuízo';
      }

      const companyStatus = {
        received: Number(received.toFixed(2)),
        send: Number(-send.toFixed(2)),
        total: Number(total.toFixed(2)),
        situation,
        results,
      }

      return res.json(companyStatus);
    });
});

app.listen(3333);
