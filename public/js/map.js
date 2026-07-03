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

// Add geolocate control to the map.
map.addControl(
    new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    })
);

// create the popup
const popup = new maplibregl.Popup({offset: 25}).setText(
    'This is a popup'
);

// Markers
const marker = new maplibregl.Marker({
    color: "#cf0f0f",
    })
    .setLngLat([-123.1207, 49.2827])
    .addTo(map)    .setPopup(popup);

