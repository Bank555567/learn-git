const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImYyZGUyZjgzODRjYmVhNmUzOTI5NjRiNGYwNDdmNWE5NzI2YWVlZmRmOWRkNjU1MTRmYTdjMzFkZjY0MzI2NjQwYWY5OTI5ZGY0YThiNThlIn0.eyJhdWQiOiIyIiwianRpIjoiZjJkZTJmODM4NGNiZWE2ZTM5Mjk2NGI0ZjA0N2Y1YTk3MjZhZWVmZGY5ZGQ2NTUxNGZhN2MzMWRmNjQzMjY2NDBhZjk5MjlkZjRhOGI1OGUiLCJpYXQiOjE3NzIzNjgwMzksIm5iZiI6MTc3MjM2ODAzOSwiZXhwIjoxODAzOTA0MDM5LCJzdWIiOiI0OTkxIiwic2NvcGVzIjpbXX0.qdpetFYUHGdXDW2qeZGMpuPKsKyR9crmWysYiKc5436N1YDALzhQYmjYSdB_Fsl2u4MuvfI6uey3E-WQL2T22SVSgilPKnGGyyQv7VDdRFGBFiBp2KO6SUzBuIhZFN9sodPmdJyryeyFrEO9eb9a69vkVGpaMfFIJ1TJAu0oVV8yXXZdSn_sj7l9LzeIHjEbgSyN9aq7NLIQVt2twMtFJGxn1BSo9GdOk1q2w_Tp-icfjM6rG0EUP-lWHr-n5gRrY_mQs3BxTgNto71uBRkl3I8Kjwi58ky67wqrEhrHv7hmucwc32PA2cT2ms6QEzym3iMohuqEXAhN-f8GYslZZ06R88rEG_cDeafXZhyhhAiVhxaJmXlTZ7nCaP40ph9CY3t8rH5JRW2bibW9Xso05plqNSkaAjXij6RUD48v9iMUsaNDKAqeBwsVF9clB3DcjqcGzL4QWb19AuHZOyXayACUfSJYml8llztciEKRqIrUSUaYuBcseOi3bzfJsWEthjcaLKpAaJeVWJzqbwt78Cmj3JbQxzTvJSm5SjX385s-kMqgSKio5AEVRyub92FHkd3duqGqaRb2Hj_dlMGtNB-zkMW0lFjOLdbrPzxIvHr0rPyOcj3KWdLEqZYYbwGvSL9QpaBlHzfjz93eogRY34u-jAL_1-osl0gOs6ICLlo'; // ใส่ token ของคุณ

const locationData = {
    "lat": 13.10, // พิกัดละติจูด
    "lon": 100.10, // พิกัดลองจิจูด
    "province": "เชียงใหม่", // ชื่อจังหวัด
    "amphoe": "เมืองเชียงใหม่", // ชื่ออำเภอ
    "fields": "tc,rh,cond" // ตัวแปรที่ต้องการ เช่น อุณหภูมิ, ความชื้น, สภาพอากาศ
};

// ฟังก์ชันในการเรียกข้อมูลพยากรณ์อากาศรายชั่วโมงจาก TMD API โดยใช้พิกัด (lat, lon)
function getHourlyForecastByCoordinates(lat, lon) {
    return $.ajax({
        "async": true,
        "crossDomain": true,
        "url": `https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at?lat=${lat}&lon=${lon}&fields=${locationData.fields}&date=2022-08-17&hour=8&duration=2`,
        "method": "GET",
        "headers": {
            "accept": "application/json",
            "authorization": `Bearer ${accessToken}`,
        }
    });
}

// ฟังก์ชันในการเรียกข้อมูลพยากรณ์อากาศรายวันจาก TMD API โดยใช้พิกัด (lat, lon)
function getDailyForecastByCoordinates(lat, lon) {
    return $.ajax({
        "async": true,
        "crossDomain": true,
        "url": `https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/at?lat=${lat}&lon=${lon}&fields=tc_max,rh&date=2017-08-17&duration=2`,
        "method": "GET",
        "headers": {
            "accept": "application/json",
            "authorization": `Bearer ${accessToken}`,
        }
    });
}

// ฟังก์ชันในการแสดงแผนที่ด้วย Leaflet.js
function initializeMap(lat, lon) {
    const map = L.map('map').setView([lat, lon], 12); // กำหนดจุดเริ่มต้นแผนที่

    // ตั้งค่าแผนที่ (ใช้ OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // เพิ่ม Marker ตำแหน่งที่ได้รับ
    L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>Your Location</b><br>Lat: ${lat}, Lon: ${lon}`)
        .openPopup();
}

// ฟังก์ชันในการสร้างพื้นที่เสี่ยงน้ำท่วม
function createFloodRiskArea() {
    if (currentLat === null || currentLon === null) {
        alert('Please get location first');
        return;
    }

    // ลบพื้นที่เดิมถ้ามี
    if (floodRiskArea) {
        map.removeLayer(floodRiskArea);
    }
    if (floodDirection) {
        map.removeLayer(floodDirection);
    }

    // สมมุติข้อมูลจาก API หรือข้อมูลจริง (Flood Depth, Water Surface Elevation, WSE)
    const floodDepth = 50; // cm (สมมุติ flood depth)

    // สร้างพื้นที่เสี่ยงน้ำท่วม (Flood Risk Area) - สีฟ้า
    floodRiskArea = L.circle([currentLat, currentLon], {
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.4,
        radius: floodDepth * 100 // ขนาดพื้นที่ตามค่า Flood Depth
    }).addTo(map).bindPopup(`Flood Risk Area: Depth ${floodDepth} cm`);

    // แสดงทิศทางการไหลของน้ำ (เส้นสีแดง)
    floodDirection = L.polyline([
        [currentLat, currentLon],
        [currentLat + 0.02, currentLon + 0.02]  // ตัวอย่างทิศทางการไหลของน้ำ
    ], {color: 'red', weight: 3, opacity: 0.7}).addTo(map);

    // เพิ่มลูกศรเพื่อแสดงทิศทาง
    L.marker([currentLat + 0.02, currentLon + 0.02], {icon: L.divIcon({
        className: 'leaflet-div-icon',
        html: '<span style="font-size: 20px; color: red;">&#8594;</span>'
    })}).addTo(map);
}

// การจัดการตำแหน่งผู้ใช้งาน
$(document).ready(function () {
    // เรียกข้อมูลพยากรณ์อากาศ
    getHourlyForecastByCoordinates(locationData.lat, locationData.lon)
        .done(function (response) {
            console.log("Hourly Forecast by Coordinates:", response);
        })
        .fail(function (error) {
            console.error("Error fetching hourly forecast by coordinates:", error);
        });

    getDailyForecastByCoordinates(locationData.lat, locationData.lon)
        .done(function (response) {
            console.log("Daily Forecast by Coordinates:", response);
        })
        .fail(function (error) {
            console.error("Error fetching daily forecast by coordinates:", error);
        });

    // เรียกใช้แผนที่
    initializeMap(locationData.lat, locationData.lon);
});