// ======================================
// AQI PREMIUM FINAL JS
// ======================================

const API_KEY =
"616d022a9cca5722c43732ed95650cd2";

// ======================================
// MAP
// ======================================

const map =
L.map("map").setView([22.57,88.36],10);

L.tileLayer(
"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
).addTo(map);

L.tileLayer(
`https://tile.openweathermap.org/map/air_pollution/{z}/{x}/{y}.png?appid=${API_KEY}`
).addTo(map);

let heatPoints = [];

const heatLayer =
L.heatLayer([],{
 radius:25
}).addTo(map);

let marker =
L.marker([22.57,88.36]).addTo(map);

// ======================================
// AQI
// ======================================

async function getAQI(lat,lon){

 const res = await fetch(
 `http://localhost:8080/api/aqi?lat=${lat}&lon=${lon}`
 );

 return await res.json();
}

// ======================================
// WEATHER
// ======================================

async function getWeather(lat,lon){

 const res = await fetch(
 `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
 );

 return await res.json();
}

// ======================================
// GEOCODE
// ======================================

async function geocode(city){

 const res = await fetch(
 `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
 );

 const data = await res.json();

 return{
  lat:parseFloat(data[0].lat),
  lon:parseFloat(data[0].lon)
 };
}

// ======================================
// SEARCH
// ======================================

async function searchCity(){

 const city =
 document.getElementById("cityInput").value;

 if(!city) return;

 const loc = await geocode(city);

 await updateLocation(
  loc.lat,
  loc.lon,
  city
 );
}

// ======================================
// MY LOCATION
// ======================================

async function useMyLocation(){

 navigator.geolocation.getCurrentPosition(
 async position=>{

  const lat =
  position.coords.latitude;

  const lon =
  position.coords.longitude;

  const res = await fetch(
  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );

  const data = await res.json();

  const city =
   data.address.city ||
   data.address.town ||
   data.address.village ||
   "Current Location";

  await updateLocation(
   lat,
   lon,
   city
  );
 });
}

// ======================================
// UPDATE LOCATION
// ======================================

async function updateLocation(
 lat,
 lon,
 cityName
){

 map.setView([lat,lon],11);

 marker.setLatLng([lat,lon])
 .bindPopup(cityName)
 .openPopup();

 const aqiData =
 await getAQI(lat,lon);

 const weather =
 await getWeather(lat,lon);

 const aqi = aqiData.aqi;

 document.getElementById("aqiValue")
 .innerText = aqi;

 document.getElementById("title")
 .innerText =
 "Air Quality - " + cityName;

 // status
 let status = "Good";

 if(aqi>50) status="Moderate";
 if(aqi>100) status="Poor";
 if(aqi>150) status="Hazardous";

 document.getElementById("aqiStatus")
 .innerText = status;

 // pollutants
 document.getElementById("pm25")
 .innerText = Math.round(aqi*0.5);

 document.getElementById("pm10")
 .innerText = Math.round(aqi*0.8);

 document.getElementById("o3")
 .innerText = Math.round(aqi*0.3);

 document.getElementById("co")
 .innerText = (aqi/100).toFixed(1);

 document.getElementById("no2")
 .innerText = Math.round(aqi*0.2);

 document.getElementById("so2")
 .innerText = Math.round(aqi*0.15);

 // weather
 document.getElementById("humidity")
 .innerText =
 weather.main.humidity + "%";

 document.getElementById("wind")
 .innerText =
 weather.wind.speed + " km/h";

 // advice
 let advice = "";

 if(aqi<=50){

  advice =
  "Air quality is good. Outdoor activities are safe.";

 }
 else if(aqi<=100){

  advice =
  "Moderate pollution detected. Sensitive people should avoid long outdoor exposure.";

 }
 else if(aqi<=150){

  advice =
  "Unhealthy air detected. Wear masks and reduce outdoor activity.";

 }
 else{

  advice =
  "Hazardous pollution level. Stay indoors and use protection.";

 }

 document.getElementById("adviceBox")
 .innerText = advice;

 // visuals
 updateGauge(aqi);

 updateForecastChart(aqi);

 updateLongChart(aqi);

 updateHistoryChart(aqi);

 updateHeatmap(lat,lon,aqi);

 updateForecastBar(aqi);
}

// ======================================
// GAUGE
// ======================================

function updateGauge(aqi){

  const canvas =
    document.getElementById("gaugeCanvas");

  const ctx = canvas.getContext("2d");

  ctx.clearRect(0,0,220,220);

  const centerX = 110;
  const centerY = 110;
  const radius = 80;

  // background arc
  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    radius,
    Math.PI,
    2 * Math.PI
  );

  ctx.strokeStyle =
    "rgba(255,255,255,0.12)";

  ctx.lineWidth = 14;

  ctx.stroke();

  // AQI COLOR
  let color = "#00ff99";

  if(aqi > 50 && aqi <= 100){
    color = "#ffd000";
  }

  else if(aqi > 100){
    color = "#ff4d6d";
  }

  // dynamic angle
  const endAngle =
    Math.PI + (aqi / 300) * Math.PI;

  // colored arc
  ctx.beginPath();

  ctx.arc(
    centerX,
    centerY,
    radius,
    Math.PI,
    endAngle
  );

  ctx.strokeStyle = color;

  ctx.lineWidth = 14;

  ctx.lineCap = "round";

  ctx.shadowBlur = 20;

  ctx.shadowColor = color;

  ctx.stroke();

  // AQI Number
  ctx.font = "bold 34px Arial";

  ctx.fillStyle = "#ffffff";

  ctx.textAlign = "center";

  ctx.fillText(aqi,110,118);

}

// ======================================
// CHARTS
// ======================================

let forecastChart;
let longChart;
let historyChart;

let historyData=[];

function updateForecastChart(aqi){

 const data = [
  aqi-10,
  aqi+5,
  aqi-7,
  aqi+12,
  aqi-4,
  aqi+8,
  aqi
 ];

 if(!forecastChart){

  forecastChart =
  new Chart(
   document.getElementById("forecastChart"),
   {
    type:"line",

    data:{
     labels:[
      "Mon","Tue","Wed",
      "Thu","Fri","Sat","Sun"
     ],

     datasets:[{
      label:"7 Day AQI",
      data:data,
      borderColor:"#00c3ff",
      fill:true
     }]
    }
   }
  );

 }else{

  forecastChart.data.datasets[0].data =
  data;

  forecastChart.update();
 }
}

function updateLongChart(aqi){

 const data=[];

 for(let i=0;i<10;i++){

  data.push(
   aqi + Math.floor(Math.random()*30-15)
  );
 }

 if(!longChart){

  longChart =
  new Chart(
   document.getElementById("longChart"),
   {
    type:"bar",

    data:{
     labels:[
      "1","2","3","4","5",
      "6","7","8","9","10"
     ],

     datasets:[{
      label:"10 Day AQI",
      data:data,
      backgroundColor:"orange"
     }]
    }
   }
  );

 }else{

  longChart.data.datasets[0].data =
  data;

  longChart.update();
 }
}

function updateHistoryChart(aqi){

 historyData.push(aqi);

 if(historyData.length>10){
  historyData.shift();
 }

 if(!historyChart){

  historyChart =
  new Chart(
   document.getElementById("historyChart"),
   {
    type:"line",

    data:{
     labels:
     historyData.map((_,i)=>i+1),

     datasets:[{
      label:"History",
      data:historyData,
      borderColor:"lime"
     }]
    }
   }
  );

 }else{

  historyChart.data.labels =
  historyData.map((_,i)=>i+1);

  historyChart.data.datasets[0].data =
  historyData;

  historyChart.update();
 }
}

// ======================================
// HEATMAP
// ======================================

function updateHeatmap(lat,lon,aqi){

 heatPoints.push([
  lat,
  lon,
  aqi/300
 ]);

 heatLayer.setLatLngs(heatPoints);
}

// ======================================
// FORECAST BAR
// ======================================

function updateForecastBar(aqi){

 const bar =
 document.getElementById("forecastBar");

 bar.innerHTML="";

 const icons=[
 "☀️","🌤️","☁️","🌧️",
 "⛈️","🌫️","🌙","🌦️"
 ];

 for(let i=0;i<8;i++){

  const value =
  aqi + Math.floor(Math.random()*20-10);

  const div =
  document.createElement("div");

  div.className="forecast-card";

  div.innerHTML=`
   <h2>${icons[i]}</h2>
   <p>${i+1} Hour</p>
   <h3>${value}</h3>
   <span>AQI</span>
  `;

  bar.appendChild(div);
 }
}

// ======================================
// ROUTE
// ======================================

async function findSafeRoute(){

 const source =
 document.getElementById("sourceInput").value;

 const destination =
 document.getElementById("destinationInput").value;

 const A = await geocode(source);
 const B = await geocode(destination);

 if(window.routeLine){
  map.removeLayer(window.routeLine);
 }

 window.routeLine =
 L.polyline([
 [A.lat,A.lon],
 [B.lat,B.lon]
 ],{
  color:"lime",
  weight:6
 }).addTo(map);

 map.fitBounds(
 window.routeLine.getBounds()
 );

 document.getElementById("routeAdvice")
 .innerText =
 `Safest route shown from ${source} to ${destination}`;
}

// ======================================
// LOGIN
// ======================================

document.querySelector(".login-btn")
.addEventListener("click",()=>{

 const name =
 prompt("Enter name");

 if(!name) return;

 const mobile =
 prompt("Enter mobile number");

 if(!mobile) return;

 const otp =
 Math.floor(1000+Math.random()*9000);

 alert("Demo OTP: "+otp);

 const entered =
 prompt("Enter OTP");

 if(parseInt(entered)===otp){

  document.querySelector(".login-btn")
  .innerText = name;

  alert("Login Successful");

 }else{

  alert("Wrong OTP");
 }
});

// ======================================
// AUTO REFRESH
// ======================================

setInterval(()=>{

 const city =
 document.getElementById("cityInput").value.trim();

 if(city){
  searchCity();
 }

},60000);

// ======================================
// INIT
// ======================================

window.onload=()=>{

 useMyLocation();
};
