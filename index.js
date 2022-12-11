const express = require('express');
const {readFileSync} = require('fs');
const handlebars = require('handlebars');

var bodyParser = require('body-parser')
var security = require('./security')
var message_processor = require('./message-processor')
var twitter = require('./twitter')

const app = express();
// Serve the files in /assets at the URI /assets.
app.use('/assets', express.static('assets'));

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

  // Apply the template to the parameters to generate an HTML string.
  try {
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

app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')



// Receives challenge response check (CRC)
app.get('/webhooks/twitter', function(request, response) {

  var crc_token = request.query.crc_token

  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, twitter.oauth.consumer_secret)

    response.status(200);
    response.send({
      response_token: 'sha256=' + hash
    })
  } else {
    response.status(400);
    response.send('Error: crc_token missing from request.')
  }
})

// Receives DM events
app.post('/webhooks/twitter', function(request, response) {

  message_processor.process(request.body) // replace this with your own bot logic

  response.send('200 OK')
})

var PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Hello from Cloud Run! The container started successfully and is listening for HTTP requests on ${PORT}`);
});



