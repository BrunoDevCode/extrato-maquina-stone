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
  
  let received = 0
  let send = 0;

  const { filename } = req.file;

  fs.createReadStream(resolve(__dirname, '..', 'tmp', 'uploads', `${filename}`))
    .pipe(csvParse())
    .on('data', line => {
      let [, type, value, , , , date, situation] = line;
    
      value = value.replace(/\D/g, '');

      results.push({
        type,
        value,
        date,
        situation
      });
    })
    .on('end', () => {
      results.map((result) => {
        
        if(result.situation === 'Recebido'){
          received = value + received;
        }
        
        if(result.situation === 'Enviado') {
          send = value + send;
        }

      });
    
    fs.unlink(resolve(__dirname, '..', 'tmp', 'uploads', `${filename}`));
    
    return response.json({results, received, send});
    });
});

app.listen(3000);
