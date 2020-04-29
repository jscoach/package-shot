const express = require("express");
const webShot = require("node-webshot");
const ejs = require("ejs");
const {readFile} = require("fs").promises;
const Joi = require("@hapi/joi");
const compression = require('compression')
const cors = require('cors')

if (!process.env.now) require("dotenv").config();
const port = process.env.now ? 8080 : 9000;

const app = express();
app.use(compression())
app.use(cors())

app.get("/", async function (req, res) {
  const template = await readFile("./views/template.ejs", {encoding: "utf8"});
  const schema = Joi.object({
    n: Joi.string().default(""),
    v: Joi.string().default(""),
    l: Joi.string().default(""),
    u: Joi.string().default(""),
    d: Joi.number().integer().default(0),
    s: Joi.number().integer().default(0),
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
    const html = ejs.render(template, value);
    const renderStream = webShot(html, {
      siteType: "html",
      defaultWhiteBackground: true,
      windowSize: {width: 973, height: 525},
      quality: 100,
      renderDelay: 2000,
    });

    res.writeHead(200, {"Content-Type": "text/plain"});
    renderStream.on("data", function (chunk) {
      res.write(chunk.toString("base64"), "base64");
    });

    renderStream.on("end", function () {
      res.end();
    });
  }
});

app.listen(port, function () {
  console.log(`Started on PORT ${port}`);
});
