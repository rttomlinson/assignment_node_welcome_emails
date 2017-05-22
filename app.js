const express = require("express");
const app = express();

// ----------------------------------------
// ENV
// ----------------------------------------
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ----------------------------------------
// Body Parser
// ----------------------------------------
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------------------
// Logging
// ----------------------------------------
const morgan = require("morgan");
const highlight = require("cli-highlight").highlight;

// Add :data format token
// to `tiny` format
let format = [
  ":separator",
  ":newline",
  ":method ",
  ":url ",
  ":status ",
  ":res[content-length] ",
  "- :response-time ms",
  ":newline",
  ":newline",
  ":data",
  ":newline",
  ":separator",
  ":newline",
  ":newline"
].join("");

// Use morgan middleware with
// custom format
app.use(morgan(format));

// Helper tokens
morgan.token("separator", () => "****");
morgan.token("newline", () => "\n");

// Set data token to output
// req query params and body
morgan.token("data", (req, res, next) => {
  let data = [];
  ["query", "params", "body"].forEach(key => {
    if (req[key]) {
      let capKey = key[0].toUpperCase() + key.substr(1);
      let value = JSON.stringify(req[key], null, 2);
      data.push(`${capKey}: ${value}`);
    }
  });
  data = highlight(data.join("\n"), {
    language: "json",
    ignoreIllegals: true
  });
  return `${data}`;
});

// ----------------------------------------
// Template Engine
// ----------------------------------------
const expressHandlebars = require("express-handlebars");

const hbs = expressHandlebars.create({
  extname: ".hbs",
  partialsDir: "views",
  defaultLayout: "main"
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

// ----------------------------------------
// Routes
// ----------------------------------------
const EmailService = require('./services/email');
app.get('/', (req, res) => {
  res.render('users/new');
});

app.post('/users', (req, res, next) => {
  const options = {
    from: 'email@email.com',
    to: req.body.email,
    subject: 'Welcome to our app',
    text: `Welcome aboard, ${req.body.firstName} ${req.body.lastName}`,
    html: `<p>Welcome aboard, ${req.body.firstName} ${req.body.lastName}</p>`
  };

  EmailService.send(options)
    .then(result => res.render('users/new', {result: JSON.stringify(result, null, 2)}))
    .catch(next);
});

// ----------------------------------------
// Server
// ----------------------------------------
const port = process.env.PORT || process.argv[2] || 3000;
const host = process.env.C9_HOSTNAME || "localhost";

let args;
process.env.NODE_ENV === "production" ? (args = [port]) : (args = [port]);

args.push(() => {
  console.log(`Listening: http://${host}:${port}\n`);
});

app.listen.apply(app, args);

// ----------------------------------------
// Error Handling
// ----------------------------------------
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.stack) {
    err = err.stack;
  }
  res.status(500).render("errors/500", { error: err });
});
