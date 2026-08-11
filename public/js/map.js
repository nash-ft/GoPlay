// Map
const map = new maplibregl.Map({
  container: "map", // container id
  style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  center: [-123.1207, 49.2827], // starting position
  zoom: 15, // starting zoom
  rollEnabled: true,
});

// Add zoom and rotation controls to the map.
map.addControl(
  new maplibregl.NavigationControl({
    visualizePitch: true,
    visualizeRoll: true,
    showZoom: true,
    showCompass: true,
  }),
  "bottom-right",
);

// Object to hold all markers
const markers = {
  basketball: [],
  soccer: [],
  tennis: [],
  golf: [],
  baseball: [],
  volleyball: [],
  swimming: [],
  gym: [],
  default: [],
};

let currentFilter = "all";
let userLocation = null;
let isLoadingFacilities = false;
let suggestionTimer = null;

// Add geolocate control to the map.
const geolocate = new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: false,
  showUserHeading: true,
});

map.addControl(geolocate, "bottom-right");

// Listen for errors
geolocate.on("error", (error) => {
  console.error("Geolocation error:", error);

  alert(
    "Unable to get your location. Please enable location services and try again.",
  );
});

geolocate.on("geolocate", (event) => {
  userLocation = {
    lat: event.coords.latitude,
    lng: event.coords.longitude,
  };

  loadSportsFacilities(userLocation.lat, userLocation.lng);
});

map.on("load", () => {
  geolocate.trigger();
});

// Load sports facilities from Overpass API
async function loadSportsFacilities(lat, lng) {
  if (isLoadingFacilities) return;

  isLoadingFacilities = true;

  // Build Overpass query
  const query = `
    [out:json];

    (
        node["sport"](around:5000,${lat},${lng});
        way["sport"](around:5000,${lat},${lng});
        relation["sport"](around:5000,${lat},${lng});

        node["leisure"="fitness_centre"](around:5000,${lat},${lng});
        way["leisure"="fitness_centre"](around:5000,${lat},${lng});
        relation["leisure"="fitness_centre"](around:5000,${lat},${lng});
    );

    out center;
    `;

  try {
    console.log("Loading nearby sports facilities...");

    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Overpass Error: ${response.status}`);
    }

    const data = await response.json();

    Object.values(markers).forEach((markerArray) => {
      markerArray.forEach((marker) => marker.remove());
      markerArray.length = 0;
    });

    data.elements.forEach((facility) => {
      addSportsFacilityMarker(facility);
    });
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingFacilities = false;
  }
}

function getFacilityType(facility) {
  if (facility.tags.leisure === "fitness_centre") {
    return "gym";
  }

  return facility.tags.sport || "default";
}

// Markers
function addSportsFacilityMarker(facility) {
  // Ways and relations store coordinates in "center"
  const lat = facility.lat || facility.center?.lat;
  const lng = facility.lon || facility.center?.lon;

  if (!lat || !lng) return;

  const facilityType = getFacilityType(facility);

  const name = facility.tags.name || "Sports Facility";
  const access = facility.tags.access || "Unknown";

  // Create popup
  const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`
        <div class="facility-popup">
            <h5>${name}</h5>

            <p>
                <strong>Sport:</strong> ${facilityType}<br>
                <strong>Access:</strong> ${access}<br>
                <strong>Distance:</strong> <span id="distance-${facility.id}">Calculating...</span><br>
            </p>

            <div class="popup-buttons">
                <button class="btn btn-primary btn-sm directions-btn"
                    data-lat="${lat}"
                    data-lng="${lng}">
                    Directions
                </button>

                <button 
                    class="btn btn-outline-success btn-sm save-btn"
                    data-id="${facility.id}"
                    data-name="${name}"
                    data-sport="${facilityType}"
                    data-access="${access}"
                    data-lat="${lat}"
                    data-lng="${lng}">
                    <i class="bi bi-bookmark"></i>
                    Save
                </button>
            </div>
        </div>
    `);

  const markerElement = document.createElement("img");

  markerElement.src = getMarkerImage(facilityType);

  markerElement.width = 35;
  markerElement.height = 35;
  markerElement.style.cursor = "pointer";

  // Create marker
  const marker = new maplibregl.Marker({
    element: markerElement,
  })
    .setLngLat([lng, lat])
    .setPopup(popup);

  if (!markers[facilityType]) {
    markers[facilityType] = [];
  }

  markers[facilityType].push(marker);

  if (currentFilter === "all" || currentFilter === facilityType) {
    marker.addTo(map);
  }
}

function getMarkerImage(type) {
  switch (type) {
    case "basketball":
      return "images/markers/basketball.png";

    case "soccer":
      return "images/markers/soccer.png";

    case "tennis":
      return "images/markers/tennis.png";

    case "golf":
      return "images/markers/golf.png";

    case "baseball":
      return "images/markers/baseball.png";

    case "volleyball":
      return "images/markers/volleyball.png";

    case "swimming":
      return "images/markers/swimming.png";

    case "gym":
      return "images/markers/gym.png";

    default:
      return "images/markers/default.png";
  }
}

// Create filter
function filterMarkers(type) {
  currentFilter = type;

  Object.values(markers).forEach((markerArray) => {
    markerArray.forEach((marker) => marker.remove());
  });

  if (type === "all") {
    Object.values(markers).forEach((markerArray) => {
      markerArray.forEach((marker) => marker.addTo(map));
    });

    return;
  }

  if (markers[type]) {
    markers[type].forEach((marker) => marker.addTo(map));
  }
}

// Connecting the buttons
document.querySelectorAll("#filter-buttons button").forEach((button) => {
  button.addEventListener("click", () => {
    document
      .querySelectorAll("#filter-buttons button")
      .forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");

    filterMarkers(button.dataset.type);
  });
});

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchResults = document.getElementById("search-results");
const clearSearchButton = document.getElementById("clear-search");

async function loadSuggestions() {
  const query = searchInput.value.trim();

  if (query.length < 2) {
    searchResults.innerHTML = "";

    return;
  }

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

    const results = await response.json();

    searchResults.innerHTML = "";

    results.forEach((place) => {
      const option = document.createElement("div");

      option.className = "search-result";

      option.textContent = place.display_name.split(",")[0];

      option.addEventListener("click", () => {
        searchInput.value = place.display_name;

        searchResults.innerHTML = "";

        searchLocation();
      });

      searchResults.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

async function searchLocation() {

  searchResults.innerHTML = "";  
  const query = searchInput.value.trim();

  if (!query) return;

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

    const results = await response.json();

    if (!results.length) {
      alert("No locations found.");

      return;
    }

    const place = results[0];

    const lat = Number(place.lat);
    const lon = Number(place.lon);

    map.flyTo({
    center: [lon, lat],
    zoom: 15
    });

    map.once("moveend", () => {

        loadSportsFacilities(lat, lon);

    });
  } catch (error) {
    console.error(error);
  }
}

searchInput.addEventListener("input", () => {

    if (searchInput.value.trim() === "") {
        clearSearchButton.classList.add("d-none");
    } else {
        clearSearchButton.classList.remove("d-none");
    }

    clearTimeout(suggestionTimer);

    suggestionTimer = setTimeout(() => {

        loadSuggestions();

    }, 300);

});

searchButton.addEventListener("click", searchLocation);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchLocation();
  }
});

clearSearchButton.addEventListener("click", () => {

    searchInput.value = "";
    searchResults.innerHTML = "";

    clearSearchButton.classList.add("d-none");

    searchInput.focus();

});

// Clear suggestions when clicking outside the search container
document.addEventListener("click", (event) => {

    if (!document.getElementById("search-container").contains(event.target)) {

        searchResults.innerHTML = "";

    }

});

document.addEventListener("click", async (event) => {

    const button = event.target.closest(".save-btn");

    if (!button) return;

    try {

        const response = await fetch("/api/favourites", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                facilityId: button.dataset.id,
                name: button.dataset.name,
                sport: button.dataset.sport,
                lat: button.dataset.lat,
                lng: button.dataset.lng,
                access: button.dataset.access

            })

        });

        if(response.status === 409){

            button.innerHTML =
                `<i class="bi bi-bookmark-fill"></i> Already Saved`;

            button.classList.remove("btn-outline-success");
            button.classList.add("btn-success");

            button.disabled = true;


            return;
        }

        if(response.ok){

            button.innerHTML =
                `<i class="bi bi-bookmark-fill"></i> Saved`;

            button.classList.remove("btn-outline-success");
            button.classList.add("btn-success");

        }

    }
    catch(error){

        console.error(error);

    }

});

// Google Directions
document.addEventListener("click", (event) => {

    const button = event.target.closest(".directions-btn");

    if (!button) return;

    if (!userLocation) {
        alert("Your location is not available.");
        return;
    }

    const destinationLat = button.dataset.lat;
    const destinationLng = button.dataset.lng;

    const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&origin=${userLocation.lat},${userLocation.lng}` +
        `&destination=${destinationLat},${destinationLng}`;

    window.open(url, "_blank");

});