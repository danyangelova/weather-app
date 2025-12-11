
// DOM ELEMENTS
const searchForm = document.getElementById("search-form");
const searchCityInput = document.getElementById("search-city-input");
const searchResult = document.getElementById("search-results");
const currentCity = document.getElementById("current-city");

let currentLocations = [];


//function which talks with Geocoding API
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

searchResult.addEventListener("click", function (event) {
    const li = event.target.closest("li");
    if(!li) return;

    const index = Number(li.dataset.index);
    const currentLocation = currentLocations[index];
    if (!currentLocation) return;

    currentCity.textContent = `${currentLocation.name}, ${currentLocation.country_code}`;
    searchResult.classList.add("hidden");
})