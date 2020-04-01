window.onload = getExif;
async function getExif() {
  var mapContainer = document.getElementById("map"), // 지도를 표시할 div
    mapOption = {
      center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
      level: 6 // 지도의 확대 레벨
    };

  var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

  imgList.forEach(img => {
    const [N, S, fileName] = img.split(",");

    if (N) {
      var content = `
            <div class="overlaybox">
                <img src="./img/${fileName}" />
            </div>
        `;

      new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(N, S), // 마커를 표시할 위치
        content: content,
        map: map, // 마커를 표시할 지도
        xAnchor: 0.3,
        yAnchor: 0.91
      });
    }
  });
}
