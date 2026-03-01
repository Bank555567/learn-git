const accessToken = 'YOUR_ACCESS_TOKEN'; // ใส่ token ของคุณ

const locationData = {
    "lat": 13.10, // พิกัดละติจูด
    "lon": 100.10, // พิกัดลองจิจูด
    "fields": "tc,rh,cond", // ตัวแปรที่ต้องการ เช่น อุณหภูมิ, ความชื้น, สภาพอากาศ
    "date": "2023-03-01", // ใช้วันที่ที่ถูกต้อง
    "hour": 8, // ชั่วโมงเริ่มต้น
    "duration": 2, // จำนวนชั่วโมงที่ต้องการ
};

// ฟังก์ชันในการแสดงแผนที่ด้วย Leaflet.js
function initializeMap(lat, lon) {
    const map = L.map('map').setView([lat, lon], 12); // กำหนดจุดเริ่มต้นแผนที่

    // ตั้งค่าแผนที่ (ใช้ OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // เพิ่ม Marker ตำแหน่งที่ได้รับ
    L.marker([lat, lon], {
        icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
        })
    }).addTo(map)
        .bindPopup(`<b>Your Location</b><br>Lat: ${lat}, Lon: ${lon}`)
        .openPopup();
}

// ฟังก์ชันในการเรียกข้อมูลพยากรณ์อากาศรายชั่วโมงจาก TMD API โดยใช้พิกัด (lat, lon)
function getHourlyForecastByCoordinates(lat, lon) {
    const url = `https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at?lat=${lat}&lon=${lon}&fields=${locationData.fields}&date=${locationData.date}&hour=${locationData.hour}&duration=${locationData.duration}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // นำข้อมูลมาประมวลผล
    })
    .catch(error => {
        console.error('Error fetching hourly forecast:', error);
        alert('ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้');
    });
}

// ฟังก์ชันในการเรียกข้อมูลพยากรณ์อากาศรายวันจาก TMD API โดยใช้พิกัด (lat, lon)
function getDailyForecastByCoordinates(lat, lon) {
    const url = `https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/at?lat=${lat}&lon=${lon}&fields=tc_max,rh&date=2017-08-17&duration=2`;

    fetch(url, {
        method: 'GET',
        headers: {
            'accept': 'application/json',
            'authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // นำข้อมูลมาประมวลผล
    })
    .catch(error => {
        console.error('Error fetching daily forecast:', error);
        alert('ไม่สามารถดึงข้อมูลพยากรณ์อากาศรายวันได้');
    });
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

document.addEventListener('DOMContentLoaded', function() {
    // เมื่อโหลดหน้าเว็บเสร็จแล้ว
    const locationButton = document.getElementById('locationButton');
    locationButton.addEventListener('click', getLocation);

    const predictionButton = document.getElementById('predictionButton');
    predictionButton.addEventListener('click', createFloodRiskArea);
});