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

let userLocation = null;

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
    userLocation = {
        lat: event.coords.latitude,
        lng: event.coords.longitude
    };
});

map.on('load', () => {
    geolocate.trigger();
});






