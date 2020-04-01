window.onload = getExif;
async function getExif() {
  var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
      level: 6 // 지도의 확대 레벨
    };

  var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

  imgList.forEach(imgName => {
    var newImg = document.createElement("img");
    newImg.src = `./img/${imgName}`;
    newImg.onload = async function() {
      console.log("onload", this);
      const [GPSLatitude, GPSLongitude] = await asyncGetExif(this);

      if (GPSLatitude) {
        const [gpsn1, gpss1] = makeGps(GPSLatitude, GPSLongitude);

        var content =
          '<div class="overlaybox">' +
          '    <div class="first">' +
          `<img src="./img/${imgName}"  />` +
          "    </div>" +
          "</div>";

        var customOverlay = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(gpsn1, gpss1), // 마커를 표시할 위치
          content: content,
          map: map, // 마커를 표시할 지도
          xAnchor: 0.3,
          yAnchor: 0.91
        });
      }

      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };

    document.body.appendChild(newImg);
  });
}
