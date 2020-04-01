function makeGps(GPSLatitude, GPSLongitude) {
  const gpsN = GPSLatitude[0] + GPSLatitude[1] / 60 + GPSLatitude[2] / 3600;
  const gpsS = GPSLongitude[0] + GPSLongitude[1] / 60 + GPSLongitude[2] / 3600;
  return [gpsN, gpsS];
}

function asyncGetExif(img) {
  return new Promise((resolve, reject) => {
    EXIF.getData(img, function() {
      const GPSLatitude = EXIF.getTag(this, "GPSLatitude");
      const GPSLongitude = EXIF.getTag(this, "GPSLongitude");
      resolve([GPSLatitude, GPSLongitude]);
    });
  });
}
