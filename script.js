
// DOM ELEMENTS
const searchForm = document.getElementById("search-form");
const searchCityInput = document.getElementById("search-city-input");


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
        console.log(locations);
        
        return locations;

    } catch (error) {
        console.log("Error fetching locations:", error);
        return [];
    }
}

searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userCityQuery = searchCityInput.value.trim();
    if (!userCityQuery) {
        alert("empty");
        return;
    }

    const locations = await fetchLocationsByName(userCityQuery);
    console.log(locations);
})
