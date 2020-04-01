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
var ExifImage = require("exif").ExifImage;

const app = new Koa();

function makeGps(GPSLatitude, GPSLongitude) {
  const gpsN = GPSLatitude[0] + GPSLatitude[1] / 60 + GPSLatitude[2] / 3600;
  const gpsS = GPSLongitude[0] + GPSLongitude[1] / 60 + GPSLongitude[2] / 3600;
  return [gpsN, gpsS];
}

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

app.use(function(ctx, next) {
  ctx.state = ctx.state || {};
  ctx.state.now = new Date();
  return next();
});

function asyncGetExifData(imgPath) {
  return new Promise((resolve, reject) => {
    new ExifImage({ image: imgPath }, function(error, exifData) {
      if (error) console.log("Error: " + error.message);
      else {
        resolve(exifData);
      }
    });
  });
}

async function getImgList() {
  const imgFolder = path.resolve(__dirname, "./static/img");
  const files = fs.readdirSync(imgFolder);
  const imgList = [];

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var suffix = file.split(".").pop();
    if (suffix.toLowerCase() === "jpg" || suffix.toLowerCase() === "png") {
      const imgPath = path.resolve(__dirname, "./static/img/" + file);
      try {
        const exifData = await asyncGetExifData(imgPath);
        if (exifData && exifData.gps) {
          const [N, S] = makeGps(exifData.gps.GPSLatitude, exifData.gps.GPSLongitude);
          imgList.push([N, S, file]);
        }
      } catch (error) {
        console.log("Error: " + error.message);
      }
    }
  }

  return imgList;
}

app.use(async function(ctx) {
  if (ctx.path.indexOf("/api") > -1) return next();
  ctx.state.version = "2.0.0";

  const imgList = await getImgList();
  await ctx.render("index", { imgList });
});

app.use(BodyParser());
app.use(Logger());
app.use(cors());

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, function() {
  console.log("==> 🌎  Listening on port %s. Visit http://localhost:%s/", PORT, PORT);
});
