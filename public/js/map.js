// Map
const map = new maplibregl.Map({
    container: 'map', // container id
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [-123.1207, 49.2827], // starting position
    zoom: 15, // starting zoom
    rollEnabled: true
});

// Add zoom and rotation controls to the map.
map.addControl(new maplibregl.NavigationControl({
    visualizePitch: true,
    visualizeRoll: true,
    showZoom: true,
    showCompass: true
}));

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
    default: []
};

let currentFilter = "all";
// let userLocation = null;

// Add geolocate control to the map.
const geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});

map.addControl(geolocate);

// Listen for errors
geolocate.on("error", (error) => {
    console.error("Geolocation error:", error);

    alert("Unable to get your location. Please enable location services and try again.");
});

geolocate.on("geolocate", (event) => {

    const lat = event.coords.latitude;
    const lng = event.coords.longitude;

    loadSportsFacilities(lat, lng);

});

map.on('load', () => {
    geolocate.trigger();
});

// Load sports facilities from Overpass API
async function loadSportsFacilities(lat, lng) {

    console.log("Loading nearby sports facilities...");

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

        // Send request to Overpass API
        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                body: query
            }
        );

        // Convert response to JSON
        const data = await response.json();

        console.log(data.elements);

        Object.values(markers).forEach(markerArray => {
            markerArray.forEach(marker => marker.remove());
            markerArray.length = 0;
        });

        // Loop through each sports facility
        data.elements.forEach(facility => {

            addSportsFacilityMarker(facility);

        });

    }
    catch(error){

        console.error("Error loading sports facilities:", error);

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

    // Create popup
    const popup = new maplibregl.Popup({ offset: 20 })
        .setHTML(`
            <div class="facility-popup">
                <h5>${facility.tags.name || "Sports Facility"}</h5>
                <p><strong>Type:</strong> ${facilityType} <br>
                <strong>Access:</strong> ${facility.tags.access || "Public"}</p>
            </div>
        `);

    const markerElement = document.createElement("img");

    markerElement.src = getMarkerImage(facilityType);

    markerElement.width = 35;
    markerElement.height = 35;
    markerElement.style.cursor = "pointer";

    // Create marker
    const marker = new maplibregl.Marker({
    element: markerElement
    })
    .setLngLat([lng, lat])
    .setPopup(popup);

    if (!markers[facilityType]) {
    markers[facilityType] = [];
    }

    markers[facilityType].push(marker);

    if (
    currentFilter === "all" ||
    currentFilter === facilityType
    ) {
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

    Object.values(markers).forEach(markerArray => {
        markerArray.forEach(marker => marker.remove());
    });

    if (type === "all") {

        Object.values(markers).forEach(markerArray => {
            markerArray.forEach(marker => marker.addTo(map));
        });

        return;
    }

    if (markers[type]) {

        markers[type].forEach(marker => marker.addTo(map));

    }

}

// Connecting the buttons
document.querySelectorAll("#filter-buttons button").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll("#filter-buttons button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        filterMarkers(button.dataset.type);

    });

});







