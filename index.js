const API_KEY = "653e11ccc43f6596dff6bdd6120bdf35";

function handleFormSubmit(event) {
  event.preventDefault();

  const cityInput = document.getElementById("cityInput").value.trim();
  const city = cityInput.replace(/\s+/g, "+");

  if (!city) return;

  fetchCurrentWeather(city);
  fetchFiveDayForecast(city);
}

function fetchCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("Current Weather:", data);
      displayCurrentWeather(data);
    })
    .catch(error => console.error("Error fetching current weather:", error));
}

function displayCurrentWeather(json) {
  if (!json || !json.main || !json.weather || !json.weather[0]) {
    document.getElementById("temperature").textContent = "N/A";
    document.getElementById("humidity").textContent = "N/A";
    document.getElementById("conditions").textContent = "N/A";
    return;
  }
  document.getElementById("temperature").textContent = `${json.main.temp} °C`;
  document.getElementById("humidity").textContent = `${json.main.humidity}%`;
  document.getElementById("conditions").textContent = json.weather[0].description;
}

function fetchFiveDayForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("5-Day Forecast:", data);
      displayFiveDayForecast(data);
      createChart(data);
    })
    .catch(error => console.error("Error fetching 5-day forecast:", error));
}

// Display the 5-day forecast in the DOM
function displayFiveDayForecast(json) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  if (!json || !json.list || !Array.isArray(json.list)) {
    forecastContainer.textContent = "No forecast data available.";
    return;
  }

  json.list.forEach(item => {
    if (!item || !item.main) return;
    const forecastDiv = document.createElement("div");
    forecastDiv.classList.add("forecast-item");

    forecastDiv.innerHTML = `
      <p><strong>${item.dt_txt || "N/A"}</strong></p>
      <p>Temp: ${item.main.temp !== undefined ? item.main.temp + " °C" : "N/A"}</p>
      <p>Humidity: ${item.main.humidity !== undefined ? item.main.humidity + "%" : "N/A"}</p>
    `;
    forecastContainer.appendChild(forecastDiv);
  });
}

// Chart.js instance variable
let chartInstance = null;

// Create a temperature chart for the 5-day forecast
function createChart(json) {
  if (!json || !json.list || !Array.isArray(json.list)) {
    return;
  }
  const labels = json.list.map(item => item.dt_txt);
  const temps = json.list.map(item => item.main && item.main.temp !== undefined ? item.main.temp : null);

  const chartCanvas = document.getElementById("forecastChart");
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext("2d");

  if (chartInstance) {
    chartInstance.destroy(); // Clear previous chart
  }

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature (°C)",
        data: temps,
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 2,
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 10,
            maxRotation: 45,
            minRotation: 45
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("weatherForm");
  form.addEventListener("submit", handleFormSubmit);
});
