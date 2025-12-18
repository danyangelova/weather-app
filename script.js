
// DOM refs -> input/output to UI
const searchForm = document.getElementById("search-form");
const searchCityInput = document.getElementById("search-city-input");
const searchResult = document.getElementById("search-results");
const currentCity = document.getElementById("current-city");

const currentDate = document.getElementById("current-date");

const currentTemp = document.getElementById("current-temp");
const currentIcon = document.getElementById("current-icon");
const currentCondition = document.getElementById("current-condition");
const currentPrecip = document.getElementById("current-precip");
const currentHumidity = document.getElementById("current-humidity");
const currentWind = document.getElementById("current-wind");


// state - reload page->losing currentLocations
let currentLocations = [];

let selectedCardLocation = null;
let currentCardWeather = null;
let minutely15CardForecast = null;

// Data source: Geocoding (locations)
async function fetchLocationsByName(name) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?` +
        `name=${encodeURIComponent(name)}` +
        `&count=3&language=en&format=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch locations (${response.status})`);

        const data = await response.json();
        const locations = data.results ?? [];
        return locations;

    } catch (error) {
        console.log("Error fetching locations:", error);
        return [];
    }
}

// Data source: Weather Forecast API (current + minutely_15)
async function fetchWeatherBundle(lat, lon) {
    const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&minutely_15=temperature_2m,weather_code` +
        `&forecast_minutely_15=5` +
        `&wind_speed_unit=kmh` +
        `&timezone=auto`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch weather bundle (${response.status})`);
        return await response.json();
    } catch (error) {
        console.log("Error fetching weather bundle:", error);
        return null;
    }
}

// Form Submit handler
searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    searchResult.classList.remove("hidden");

    const userCityQuery = searchCityInput.value.trim();
    if (!userCityQuery) {
        alert("empty");
        return;
    }

    const locations = await fetchLocationsByName(userCityQuery);
    currentLocations = locations;
    if (locations.length === 0) {
        searchResult.innerHTML = "<p>No locations found.</p>"
        searchCityInput.value = "";
        return;
    }

    const listItems = locations
        .map((location, index) => {
            const country = location.country ?? location.country_code;
            const nameAndCountry = `${location.name}, ${country}`;
            return `<li data-index="${index}">${nameAndCountry}</li>`;
        })
        .join("");

    searchResult.innerHTML = `
        <ul>
            ${listItems}
        </ul>
    `;

    searchCityInput.value = "";
})

// Handle location selection (div clicked)
searchResult.addEventListener("click", async function (event) {
    const li = event.target.closest("li");
    if (!li) return;

    const index = Number(li.dataset.index);
    const currentLocation = currentLocations[index];
    if (!currentLocation) return;

    selectedCardLocation = currentLocation;
    // console.log(currentLocation);

    currentCity.textContent = `${currentLocation.name}, ${currentLocation.country_code}`;
    searchResult.classList.add("hidden");

    const data = await fetchWeatherBundle(currentLocation.latitude, currentLocation.longitude);
    console.log(data);
    if (!data) {
        console.warn("No weather data received (fetchWeatherBundle returned null).");
        return;
    }
    currentCardWeather = data.current;
    minutely15CardForecast = data.minutely_15;

    renderCurrentWeather(currentCardWeather);
})

function mapWeatherCodeToInfo(codeNum) {
    if (codeNum === 0) return { label: "Clear sky", icon: "☀️" };

    if (codeNum === 1) return { label: "Mainly clear", icon: "🌤️" }
    if (codeNum === 2) return { label: "Partly cloudy", icon: "⛅" }
    if (codeNum === 3) return { label: "Cloudy", icon: "☁️" }

    if (codeNum === 51 || codeNum === 53 || codeNum === 55) return { label: "Drizzle", icon: "🌦️" };
    if (codeNum === 61 || codeNum === 63 || codeNum === 65) return { label: "Rain", icon: "🌧️" };

    if (codeNum === 71 || codeNum === 73 || codeNum === 75) return { label: "Snow", icon: "🌨️" };

    if (codeNum === 95) return { label: "Thunderstorm", icon: "⛈️" };

    return { label: `Unknown (${codeNum})`, icon: "❓" };
}

// Render Function
function renderCurrentWeather(current) { //renderCurrentWeather(currentCardWeather)
    currentTemp.textContent = `${Math.round(current.temperature_2m)}°C`;
    currentHumidity.textContent = `${current.relative_humidity_2m}%`;
    currentWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    
    const {label, icon} = mapWeatherCodeToInfo(current.weather_code);
    currentCondition.textContent = label;
    currentIcon.textContent = icon;
}



// Utility: format Date object into readable weekday + month + day
function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });
}
currentDate.textContent = formatDate(new Date());