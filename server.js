const Koa = require("koa");
const BodyParser = require("koa-bodyparser");
const Router = require("koa-router");
const Logger = require("koa-logger");
const serve = require("koa-static");
const cors = require("koa-cors");
const fs = require("fs");
const path = require("path");
const render = require("koa-ejs");
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

app.use(serve(path.resolve(__dirname, "static")));

render(app, {
  root: path.join(__dirname, "./"),
  layout: "index",
  viewExt: "html",
  cache: false,
  debug: false
});

// const indexHtml = fs.readFileSync(path.resolve(__dirname, "./index.html"), {
//   encoding: "utf8"
// });

app.use(function(ctx, next) {
  ctx.state = ctx.state || {};
  ctx.state.now = new Date();
  ctx.state.ip = ctx.ip;
  ctx.state.version = "2.0.0";
  return next();
});

function getFileList() {
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve(__dirname, "./static/img"), (err, file_list) => {
      console.log(file_list);
      resolve(file_list);
    });
  });
}
app.use(async function(ctx) {
  if (ctx.path.indexOf("/api") > -1) return next();
  ctx.state.version = "2.0.0";
  const file_list = await getFileList();
  await ctx.render("index", { file_list });
});

app.use(BodyParser());
app.use(Logger());
app.use(cors());

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, function() {
  console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/", PORT, PORT);
});
