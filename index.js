const express = require('express');
const {readFileSync} = require('fs');
const handlebars = require('handlebars');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config() // see https://github.com/motdotla/dotenv
// gcloud run deploy --source . (this line including the . will deploy successfully)
var bodyParser = require('body-parser')


const app = express();
app.use('/assets', express.static('assets')); // Serve the files in /assets at the URI /assets.

// The HTML content is produced by rendering a handlebars template.
// The template values are stored in global state for reuse.
const data = {
  service: process.env.K_SERVICE || '???',
  revision: process.env.K_REVISION || '???',
};
let template;

app.get('/', async (req, res) => {  // The handlebars template is stored in global state so this will only once.
  if (!template) {  // Load Handlebars template from filesystem and compile for use.
    try {
      template = handlebars.compile(readFileSync('index.html.hbs', 'utf8'));
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
    }
  }

  try {   // Apply the template to the parameters to generate an HTML string.
    const output = template(data);
    res.status(200).send(output);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set('views', __dirname + '/GCR/views')
app.set('view engine', 'ejs')

var PORT = process.env.PORT || 8080;
app.listen(PORT);
console.log(`You're listening on the port ${PORT}!`);