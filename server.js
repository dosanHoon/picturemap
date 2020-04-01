const Koa = require("koa");
const BodyParser = require("koa-bodyparser");
const Router = require("koa-router");
const Logger = require("koa-logger");
const serve = require("koa-static");
const cors = require("koa-cors");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 8887;

const app = new Koa();

app
  .use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get("X-Response-Time");
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
  })
  .use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set("X-Response-Time", `${ms}ms`);
  });

fs.readdir(path.resolve(__dirname, "./img"), (err, file_list) => {
  console.log(file_list);
});

const indexHtml = fs.readFileSync(path.resolve(__dirname, "./index.html"), {
  encoding: "utf8"
});

app.use(serve(path.resolve(__dirname, "./")));

app.use((ctx, next) => {
  if (ctx.path.indexOf("/api") > -1) return next();
  ctx.body = indexHtml;
});

app.use(BodyParser());
app.use(Logger());
app.use(cors());

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, function() {
  console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/", PORT, PORT);
});
