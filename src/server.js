const express = require('express');
const multer = require('multer');
const csvParse = require('csv-parse');
const fs = require('fs');
const { resolve } = require('path');

const upload = multer({ dest: 'tmp/uploads' });

const app = express();

app.use(express.json());

app.post('/', upload.single('extract'), (req, res) => {

  const results = [];

  let received = 0, send = 0;

  const { filename } = req.file;

  fs.createReadStream(resolve(__dirname, '..', 'tmp', 'uploads', `${filename}`))
    .pipe(csvParse())
    .on('data', line => {
      let [, , value, , , , date, situation] = line;

      results.push({
        situation,
        value: Number(value),
        date,
      });
    })
    .on('end', async () => {
      results.map((result) => {
        // const date = new Date(result.date);
        // const day = date.getDate();
        // const month = date.getMonth();
        // const year = date.getFullYear();

        /**
         * Separar por mês
         */

        if (result.situation === 'Recebido') {
          received = result.value + received;
        }

        if (result.situation === 'Enviado') {
          send = result.value + send;
        }
      });

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

app.listen(3000);
