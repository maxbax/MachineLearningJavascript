const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());

const PORT = 5000;

const FilesFolder = 'uploads';
const FileModel = 'model.json';
const FileModelWeights = 'model.weights.bin';

const storage = multer.diskStorage({
  destination(req, file, callback) {
    if (!fs.existsSync(FilesFolder)) {
      fs.mkdirSync(FilesFolder);
    }
    callback(null, FilesFolder);
  },
  filename(req, file, callback) {
    callback(null, file.fieldname);
  },
});
const upload = multer({ storage });

app.post('/uploadModel', upload.fields([{
  name: FileModel, maxCount: 1,
}, {
  name: FileModelWeights, maxCount: 1,
}]), (req, res, next) => {
  const { complete } = req;
  if (!complete) {
    const error = new Error('Error during upload');
    error.httpStatusCode = 400;
    return next(error);
  }
  return res.send(complete);
});

app.get('/downloadModel', (req, res) => {
  const file = `${FilesFolder}/${FileModel}`;
  res.download(file);
});

app.get('/downloadModelWeight', (req, res) => {
  const file = `${FilesFolder}/${FileModelWeights}`;
  res.download(file);
});


app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`Backend ready on port ${PORT}`);
});
