let map; // ประกาศตัวแปร map เป็น global

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
    map = L.map('map').setView([lat, lon], 12); // กำหนดจุดเริ่มต้นแผนที่

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

// ฟังก์ชันในการค้นหาตำแหน่งของผู้ใช้
function getLocation() {
    console.log("getLocation function called!");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

// ฟังก์ชันในการแสดงตำแหน่งบนแผนที่
function showPosition(position) {
    const currentLat = position.coords.latitude;
    const currentLon = position.coords.longitude;

    console.log("Latitude: " + currentLat);
    console.log("Longitude: " + currentLon);

    // ปรับแผนที่ไปยังตำแหน่งของผู้ใช้
    map.setView([currentLat, currentLon], 12); // Zoom in on the current position

    // เพิ่ม Marker ที่ตำแหน่งของผู้ใช้
    L.marker([currentLat, currentLon]).addTo(map)
        .bindPopup(`<b>Your Location</b><br>Lat: ${currentLat}, Lon: ${currentLon}`)
        .openPopup();

    // เปิดใช้งานปุ่ม Prediction หลังจากได้ตำแหน่ง
    document.getElementById('predictionButton').disabled = false;
}

// ฟังก์ชันจัดการข้อผิดพลาดเมื่อไม่สามารถค้นหาตำแหน่ง
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
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

// เมื่อโหลดหน้าเว็บเสร็จแล้ว
document.addEventListener('DOMContentLoaded', function () {
    // เรียกใช้ฟังก์ชันในการค้นหาตำแหน่งของผู้ใช้
    const locationButton = document.getElementById('locationButton');
    locationButton.addEventListener('click', getLocation);

    // เรียกใช้ฟังก์ชันในการสร้างพื้นที่เสี่ยงน้ำท่วม
    const predictionButton = document.getElementById('predictionButton');
    predictionButton.addEventListener('click', createFloodRiskArea);
});