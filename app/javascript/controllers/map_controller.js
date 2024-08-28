import { Controller } from "@hotwired/stimulus";
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

// Connects to data-controller="map"
export default class extends Controller {
  static targets = ["waypointsInput", "mapContainer"]

  connect() {
    this.markers = new Map();
    this.landmarks = this.landmarks || [];
    const mapboxAccessToken = this.element.dataset.mapboxApiKey;
    mapboxgl.accessToken = mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/chikas/cm00elyc0007101pw2mloe5uw',
      center: [139.759455, 38.6828391], // starting position
      zoom: 4.5
    });

    this.map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: false
      }),
      'top-left'
    );

    this.map.addControl(
      new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      types: "country,region,place,postcode,locality,neighborhood,address, poi",
      mapboxgl: mapboxgl,
      countries: 'jp',
      placeholder: 'Search for a place',
      className: 'custom-geocoder'
    }),
    );

    this.waypoints = this.initializeWaypoints();

    this.map.on('click', (event) => {
        const coords = [event.lngLat.lng, event.lngLat.lat];
        this.waypoints.push(coords);
        this.updateWaypoints();
    });

    this.updateWaypointList();

    this.element.addEventListener('landmark:add', (event) => {
      const { coordinates } = event.detail;
      this.landmarks.push(coordinates);
      this.addLandmarkMarker(coordinates, `landmark-${this.landmarks.length - 1}`, "#000", true);
    });

  }

  addLandmarkMarker(coords, id, color, useCustomMarker = false) {
    console.log('Adding landmark marker at', coords);
    const markerElement = useCustomMarker ? this.createLandmarkCustomMarkerElement(id) : null;
    const marker = new mapboxgl.Marker(markerElement || { color })
      .setLngLat(coords)
      .addTo(this.map);
    this.markers.set(id, marker);
    console.log('Landmark marker', marker);
  }

  createLandmarkCustomMarkerElement(id) {
    const el = document.createElement('div');
    el.id = `marker-${id}`
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(${this.data.get("pinPurple")})`; // URL to your custom icon
    el.style.width = '42px'; // Size of the icon
    el.style.height = '42px';
    el.style.backgroundSize = '100%';
    return el;
  }


    initializeWaypoints() {
      const waypointsInput = document.querySelector('#waypoints_input');
      return waypointsInput ? JSON.parse(waypointsInput.value || '[]') : [];
    }


    updateWaypoints(){

      // remove all the existing marker, before re-rendering them
      document.querySelectorAll(".custom-marker").forEach(marker => marker.remove())
      console.log(document.querySelectorAll(".custom-marker"));


      // re-rendering markers
      this.waypoints.forEach((point, index) => {
        this.addMarker(point, `waypoint-${index}`,
          index === 0 ? '#3887be' : '#f30', true);
      });


      // re-rendering landmarks
      this.landmarks.forEach((coords, index) => {
        this.addLandmarkMarker(coords, `landmark-${index}`, "#000", true);
      });

      if (this.waypoints.length > 1) {
        this.getRoute(this.waypoints);
      } else {
        if (this.map.getSource('route')) {
          this.map.removeLayer('route');
          this.map.removeSource('route');
        }
      }

      const waypointsInput = document.querySelector('#waypoints_input');
      if (waypointsInput) {
      waypointsInput.value = JSON.stringify(this.waypoints);
      }

      this.updateWaypointList();
    }



    addMarker(coords, id, color, useCustomMarker = false) {
      console.log('Adding marker at', coords);
      const markerElement = useCustomMarker ? this.createCustomMarkerElement(id) : null;
      const marker = new mapboxgl.Marker(markerElement || { color })
        .setLngLat(coords)
        .addTo(this.map);
      this.markers.set(id, marker);
      console.log("this.waypoints:", this.waypoints)
    }


    createCustomMarkerElement(id) {
      const el = document.createElement('div');
      el.id = `marker-${id}`
      console.log("id:", id )
      el.className = 'custom-marker';
      //el.style.backgroundImage = `url(${this.data.get("logoUrl")})`;
      if (id == "waypoint-0") {
        el.style.backgroundImage = `url(${this.data.get("pinOne")})`
      }
      else if (id == "waypoint-1") {
        el.style.backgroundImage = `url(${this.data.get("pinTwo")})`
      }
      else if (id == "waypoint-2") {
        el.style.backgroundImage = `url(${this.data.get("pinThree")})`
      }
      else if (id == "waypoint-3") {
        el.style.backgroundImage = `url(${this.data.get("pinFour")})`
      }
      else if (id == "waypoint-4") {
        el.style.backgroundImage = `url(${this.data.get("pinFive")})`
      }
      else if (id == "waypoint-5") {
        el.style.backgroundImage = `url(${this.data.get("pinSix")})`
      }
      else if (id == "waypoint-6") {
        el.style.backgroundImage = `url(${this.data.get("pinSeven")})`
      }
      else if (id == "waypoint-7") {
        el.style.backgroundImage = `url(${this.data.get("pinEight")})`
      }
      else if (id == "waypoint-8") {
        el.style.backgroundImage = `url(${this.data.get("pinNine")})`
      }
      else if (id == "waypoint-9") {
        el.style.backgroundImage = `url(${this.data.get("pinTen")})`
      }
      else {
        el.style.backgroundImage = `url(${this.data.get("logoUrl")})`;
      }

      el.style.width = '42px'; // Size of the icon
      el.style.height = '42px';
      el.style.backgroundSize = '100%';
      return el;
    }



    removeWaypoint(event){
      const index = parseInt(event.currentTarget.dataset.index);
      const waypointId = `waypoint-${index}`;

      console.log("Attempting to remove waypoint with ID:", waypointId);
      console.log(this.markers);
      if (this.markers.has(waypointId)) {
        const marker = this.markers.get(waypointId);
        console.log(`marker-${waypointId}`, marker, this.markers);
        marker.remove();  // This removes the marker from the map
        this.markers.delete(waypointId);  // This removes the marker from the tracking map
        console.log(marker, this.markers);

      }
      console.log(this.waypoints);
      this.waypoints.splice(index, 1);

      this.updateWaypoints(); // Ensure map markers and route are updated
      //this.updateWaypointList(); // Update the lis
    }

    updateWaypointList() {
      const waypointsList = document.querySelector('#waypoints-list');
      if (!waypointsList) return;

      waypointsList.innerHTML = '';

      this.waypoints.forEach((coords, index) => {
        const listItem = document.createElement('div');
        // listItem.textContent = `Waypoint ${index + 1} - Lat: ${coords[1]}, Lng: ${coords[0]} `;
        listItem.textContent = `Waypoint: ${index + 1} `;
        listItem.classList.add('no-marker');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'custom-remove-btn');
        removeButton.setAttribute('type', 'button');
        removeButton.dataset.action = 'click->map#removeWaypoint';
        removeButton.dataset.index = index;
        listItem.appendChild(removeButton);
        waypointsList.appendChild(listItem);
      });
    }

  getRoute(waypoints) {
    const waypointsString = waypoints.map(p => p.join(',')).join(';');
    fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${waypointsString}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: 'GET' }
    )
    .then(response => response.json())
    .then(json => {
      const data = json.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      };

      if (this.map.getSource('route')) {
        this.map.getSource('route').setData(geojson);
      } else {
        this.map.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ff5e5e',
            'line-width': 4
          }
        });
      }
    });
  }
}
