// แสดงแผนที่ใน Leaflet.js
const map = L.map('map').setView([13.10, 100.10], 10); // Default to Chiang Mai
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// ฟังก์ชันค้นหาตำแหน่งจากชื่อสถานที่
async function getLocation() {
    const locationName = document.getElementById('location').value;
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${locationName}&format=json&limit=1`);
    const data = await response.json();

    if (data && data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        // เลื่อนแผนที่ไปยังตำแหน่งที่ค้นหา
        map.setView([lat, lon], 12); // Zoom in on the location

        // เพิ่ม Marker ที่ตำแหน่งนั้น
        L.marker([lat, lon]).addTo(map)
            .bindPopup(`<b>${locationName}</b><br>Lat: ${lat}, Lon: ${lon}`)
            .openPopup();

        // ดึงข้อมูลพยากรณ์น้ำท่วมจาก API
        fetchFloodPrediction(lat, lon);
    } else {
        alert("Location not found, please try again.");
    }
}

// ฟังก์ชันดึงข้อมูลพยากรณ์น้ำท่วม
async function fetchFloodPrediction(lat, lon) {
    const apiUrl = `https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly?lat=${lat}&lon=${lon}&fields=tc,rh&date=2022-08-17&hour=8&duration=2`;
    const apiKey = 'YOUR_ACCESS_TOKEN';  // ใส่ API Key ที่คุณได้รับ

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        console.log(data);  // ตรวจสอบข้อมูลที่ได้จาก API

        // แสดงพื้นที่เสี่ยงน้ำท่วม (สีฟ้า)
        L.circle([lat, lon], {
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.4,
            radius: 3000  // ขนาดพื้นที่เสี่ยง
        }).addTo(map).bindPopup(`Flood Risk Area: Depth ${data.tc} cm`);

        // แสดงทิศทางการไหลของน้ำ (ลูกศรสีแดง)
        L.polyline([
            [lat, lon], 
            [lat + 0.02, lon + 0.02]  // ตัวอย่างการแสดงทิศทางการไหล
        ], {color: 'red', weight: 3, opacity: 0.7}).addTo(map);

        // เพิ่มลูกศรที่ตำแหน่งทิศทาง
        L.marker([lat + 0.02, lon + 0.02], {icon: L.divIcon({
            className: 'leaflet-div-icon',
            html: '<span style="font-size: 20px; color: red;">&#8594;</span>'
        })}).addTo(map);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}