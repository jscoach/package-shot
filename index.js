const express = require("express");
const ejs = require("ejs");
const {readFile} = require("fs").promises;
const path = require("path");
const Joi = require("@hapi/joi");
const compression = require('compression')
const cors = require('cors')
const nodeHtmlToImage = require('node-html-to-image')
const getScreenshot = require('./screenshot');

if (!process.env.now) require("dotenv").config();
const port = process.env.now ? 8080 : 9000;

const app = express();
app.use(compression())
app.use(cors())

app.get("/", async function (req, res) {
  const template = await readFile(path.join(__dirname, './views/template.ejs'), {encoding: "utf8"});
  const schema = Joi.object({
    n: Joi.string().default(""),
    v: Joi.string().default(""),
    l: Joi.string().default(""),
    u: Joi.string().default(""),
    d: Joi.string().default(0),
    s: Joi.string().default(0),
    c: Joi.array().default(["Major Browsers"]),
    i: Joi.string().default("https://avatars2.githubusercontent.com/u/33937285?s=200&v=4"),
    p: Joi.number().integer().default(0),
  });

  const result = await schema.validate(req.query);
  const {value, error} = result;
  const valid = error == null;
  if (!valid) {
    res.status(422).json({
      message: "Invalid request",
      data: error,
    });
  } else {
    const html = await ejs.render(template, value);
    const file = await getScreenshot(html);

    res.setHeader('Content-Type', `image/png`);
    res.end(file);
  }
});

app.listen(port, function () {
  console.log(`Started on PORT ${port}`);
});

