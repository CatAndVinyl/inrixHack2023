import logo from './logo.svg';
import './App.css';
import './index.css'

import {
  useJsApiLoader,
  GoogleMap,
} from '@react-google-maps/api';

import { useState, createRef, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Endpointbox from './Endpointbox';
import L from "leaflet";
import { permute, calculateDistances, isValid, tsp_pc } from './tsp_pc';

import TaskList from "./TaskList";

const center = [37.774564731252646,-122.40894392413465]
function App({addDestination, subtractDestination, getGeocodedCoords, getGeocodedCoordsFromString, drawRoutes}) {
  //fix this if have time
  //put in .env or move to backend
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyD7ybO9gWjqZTjNv1CpitYk70ry_ZWZvOg",
    libraries:["places"],
  })

  var userDestIcon = L.icon({
        iconUrl: 'Map_pin_icon_green.png',
        iconSize:     [38, 38],
        iconAnchor:   [19, 38],
        popupAnchor:  [-3, -76]
  });

  var taskIcon = L.icon({
    iconUrl: '/home-address.png',
    iconSize:     [38, 38],
    iconAnchor:   [19, 38],
    popupAnchor:  [-3, -76]
  });

  const [map, setMap] = useState(null);
  //let map;
  const [endpoints,setEndpoints] = useState([]);
  const [endpointComponents, setEndpointComponents] = useState([]);
  const [arrLength, setArrLength] = useState(2);
  let [numTasks, setNumTasks] = useState(0);

  const [tasks,setTasks] = useState([]);
  const [acceptedTasks,setAcceptedTasks] = useState([]);

  const [polygons,setPolygons] = useState([]);

  const [time_dist, setTimeDist] = useState(0);

  const handleSliderChange = (event) => {
    setTimeDist(parseInt(event.target.value, 10));
  };

  //let mapHookRun = false;

  //Good Code Don't Touch
  //for creating or deleting endpoint components
  useEffect(() => {
    //group.clearLayers();
    console.log("cleared");
    const newElRefs = [];

    for (let i = 0; i < arrLength; i++) {
      newElRefs.push(endpoints[i] || createRef());
    }
    
    setEndpoints(newElRefs);

    const newEndpointComponents = [];
    for (let i = 0; i < arrLength; i++) {
      newEndpointComponents.push(
        <Endpointbox key={i} customKey={i+1} originRef={newElRefs[i]}/>
      );
    }
    setEndpointComponents(newEndpointComponents);
  }, [arrLength]);

  useEffect(() => {
    drawTaskMarkers();
  },[tasks]);

  async function drawTaskMarkers()
  {
    console.log(tasks.length);
    let tasks_geocoded = [];
    for(let i = 0; i < tasks.length; i++)
      tasks_geocoded.push(await getGeocodedCoordsFromString(tasks[i].origin));

    for(let i = 0; i < tasks_geocoded.length; i++)
    {
      let marker = L.marker(L.latLng(tasks_geocoded[i]), {icon: taskIcon}).addTo(map);

      let div = document.createElement('div');
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      let nameDiv = document.createElement('div');
      let name_text = document.createTextNode(tasks[i].name + " - " + tasks[i].origin);
      nameDiv.appendChild(name_text);
      let userRequestDiv = document.createElement('div');
      let request_text = document.createTextNode(tasks[i].user_request);
      userRequestDiv.appendChild(request_text);
      userRequestDiv.style.paddingTop = '10px';
      userRequestDiv.style.paddingBottom = '10px';
      let locationDiv = document.createElement('div');
      let location_text = document.createTextNode(tasks[i].place);
      locationDiv.appendChild(location_text);
      let button = document.createElement('button');
      button.textContent = 'Accept Task';
  
      // Attach a click event listener to the button
      button.addEventListener('click', function() {
        setAcceptedTasks([...acceptedTasks, tasks[i]]);
        setNumTasks(numTasks + 1);
      });
      div.appendChild(nameDiv);
      div.appendChild(userRequestDiv);
      div.appendChild(locationDiv);
      div.appendChild(button);
      var popup = L.popup().setContent(div);
      marker.bindPopup(popup);
    }
  }

  async function findTasks()
  {
    //check if inputs are filled
    for(let i = 0; i < endpoints.length; i++)
    {
      if(endpoints[i].current.value == '' || endpoints[i].current.value == null)
        return;
    }
    setTasks(await getTasks());
    //await drawTaskMarkers();
  }

  //move this to backend if have time - dont expose apikey
  async function getRoutes(waypoints)
  {
    try{
  const userToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6ImE5ZDdpZXhkaTIiLCJ0b2tlbiI6eyJpdiI6IjFkZTk4ZWU0YzUwNDY1ZjViMjI2ZjFjNmY1YzM0YjdlIiwiY29udGVudCI6IjZjNzg3MzFlNGUzYTEzNWNmMWUxODhhZWJiMDM3YjQ5NThhZTFjOWRmYTBiZGUzMmU1MDk0YmEwM2FjOGJiMTk3YzNkZmE1NTRjMWZjNGRlNzc0OGE3M2YyNTI1NjkzOTllMDU0ZDgyMGUyZDVlOTRkYTc2NTVjNWJlMmNhYTQ2N2Y0NGFmMzcwZmFmYWRmNTlhMzA1OTZiOGQzMDYyYTVlMzAwYzc3ZDg0OThlNDNjN2MyYTdlNWQwYmRmNjU4NGVjOTVkM2UzOGMwZjMwNjgzMGY1NDU1NWY2YmZhMDE2OTIwNjBiNDM4Nzc3ZWNjMzM1MmQxMjkzNTAyOTQyMDk5ZDA4ZmEyNDQ5ZGQ1NTFhOWFiNzgxMDYyYjE4NzE4YjlkYTM0NDZkNWE1OGNhNTkxOTA4MDRiYThiN2IxYTJhMzEzNWNhODBjZDMyMTc5YzI4MDkyNDE4MzA0ZGIwMmFjZWIzMWU5OGVjMGU2MDU0ODE5ZmEyNjcyYWRlZmFiYmEwOTRiNjBhOTBlZjlmNzBhZWEyZTYxMzhhMmNjOWI3NDE4YzdiZDRiZjlmY2JiMjMxNTY1MjdmZTA1ZGNkZWY3N2EwOTViOTc1ZjY0NDY1ZmUxZTIzYzUyNTBiNzU2NGZhZmIxMjliN2M0MDk3NGQ3YzZlZDgxYzQ3ZWVjOWEwZjkyODU4MmU4MjRlODliYjQzNjNkOTY0MGVlMWRjZGZlZThkNmQwYjRiOTJiYTNhNDc5Mzc3YmVjNTgwZjhlMDQ0OTdiNzA3NmQ0NmJkMWUzNzkxZTJlZDQxYWM3NTZlOGU4ZjNlMTVhMWE0NDY4YmQ4YjI4ZDQ1MzExMTgyODg4ZTU0ZDRiMGQwNTQzOTQxOWQ4ZGEwIn0sInNlY3VyaXR5VG9rZW4iOnsiaXYiOiIxZGU5OGVlNGM1MDQ2NWY1YjIyNmYxYzZmNWMzNGI3ZSIsImNvbnRlbnQiOiI0YjYzNzIxMjVhNTcxZDc0Y2JlNTk2YmVhOTFmNmIxNjVmYTQyNjhiZjIzZGU4NDhjMDJiNTFjYzM5ZjJlNjI5NGQzZmYxNTQwNDE0ZGFhNTI4NjI5ODAxIn0sImp0aSI6ImUwOWY0OTIwLTkzODYtNGU4OC05YTNhLTM1NmE3YmMyNWY0NiIsImlhdCI6MTY5OTc5ODY1MywiZXhwIjoxNjk5ODAyMjUyfQ.kRsDQq97j6KAYI9lhmhuceR3h1I8rCInVMiytObBDhQ';
  const apiUrl = `https://api.iq.inrix.com/findRoute?maxAlternates=2&useTraffic=true&units=1&routeOutputFields=B,M,P,S,W&isAmbiguousOrigin=true&format=json`;
  const waypointsQueryString = waypoints.map((waypoint, index) => {
    const { lat, lng } = waypoint;
    return `wp_${index + 1}=${lat},${lng}`;
  }).join('&');
  const fullUrl = `${apiUrl}&${waypointsQueryString}`;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + userToken
      }
    });

    const json = await response.json();
    let tmp = json.result.trip.routes[0].travelTimeMinutes;
    return json;
  } catch (error) {
    console.error("too many line requests trying again in 2 seconds");
            await new Promise(resolve => setTimeout(resolve, 2000));
            return await getDriveTimePolygon(waypoints);
  }
  }

  async function generateRoutes()
  {
    console.log(polygons);
    console.log("endpoints",endpoints);
    //check if inputs are filled
    for(let i = 0; i < endpoints.length; i++)
    {
      if(endpoints[i].current.value == '' || endpoints[i].current.value == null)
        return;
    }

    clearEverything();

    await drawTaskMarkers();

    let endpoints_geocoded = await getGeocodedCoords(endpoints);

    //use latlngs as the final waypoints, in order of the routes, for both destinations and tasks
    let latlngs = [];
    for(let i = 0; i < endpoints_geocoded.length; i++)
    {
      latlngs.push(L.latLng(endpoints_geocoded[i]));
      L.marker(latlngs[i], {icon: userDestIcon}).addTo(map);
    }
    let accepted_tasks_latlngs = [];
    let accepted_tasks_loc_latlngs = [];
    for(let i = 0; i < acceptedTasks.length; i++)
    {
      accepted_tasks_latlngs.push(L.latLng(await getGeocodedCoordsFromString(acceptedTasks[i].origin)));
      accepted_tasks_loc_latlngs.push(L.latLng(await getGeocodedCoordsFromString(acceptedTasks[i].place)));
    }
    let totalEndpoints = [...latlngs,...accepted_tasks_latlngs];
    let constraints = {};
    for(let i = 0; i < accepted_tasks_loc_latlngs.length; i++)
    {
      for(let j = 0; j < latlngs.length; j++)
      {
        if(accepted_tasks_loc_latlngs[i].lat == latlngs[j].lat && accepted_tasks_loc_latlngs[i].lng == latlngs[j].lng)
          constraints[latlngs.length + i] = j;
      }
    }
    //console.log(tsp_pc(totalEndpoints.length, distances, constraints));
    const distances = [];
    for(let i = 0; i < totalEndpoints.length; i++)
    {
      const row = [];
      for(let j = 0; j < totalEndpoints.length; j++)
        row.push(0);
      distances.push(row);
    }
    for(let i = 0; i < totalEndpoints.length; i++)
    {
      for(let j = i+1; j < totalEndpoints.length; j++)
      {
        const res = await getRoutes([totalEndpoints[i],totalEndpoints[j]]);
        distances[i][j] = res.result.trip.routes[0].travelTimeMinutes;
      }
    }
    for (let i = 0; i < totalEndpoints.length; i++) 
    {
      for (let j = i; j < totalEndpoints.length; j++)
        distances[j][i] = distances[i][j];
    }
    const [optimal_perm,total_dist] = tsp_pc(totalEndpoints.length, distances, constraints);
    
    const finalEndpoints = [totalEndpoints[0]];
    for(let i = 0; i < optimal_perm.length; i++)
      finalEndpoints.push(totalEndpoints[optimal_perm[i]]);
    
    console.log("total endpoints",totalEndpoints);
    console.log(total_dist, " ", optimal_perm);
    console.log("final endpoints",finalEndpoints);
    console.log(distances);

    const json_res = await getRoutes(finalEndpoints);
    //console.log(resp);
    const coords = json_res.result.trip.routes[0].points.coordinates;
    console.log(json_res);
    let route_latlngs = [];
    for(let i = 0; i < coords.length; i++)
      route_latlngs.push(L.latLng(coords[i][1],coords[i][0]));

    L.polyline(route_latlngs,{
      color: 'black', // Color of the main line
      weight: 5,  // Weight (thickness) of the main line
      // Other options for your main polyline
    }).addTo(map);

    L.polyline(route_latlngs,{
      color: '#ADD8E6', // Color of the main line
      weight: 3,  // Weight (thickness) of the main line
      // Other options for your main polyline
    }).addTo(map);

    //console.log("z",endpoints_geocoded[0]);

    let lastSuccessfulIndex = 0;
    let polygs = [];
    for(let i = lastSuccessfulIndex; i < endpoints_geocoded.length; i++)
    {
      try{
        const poly_res = await getDriveTimePolygon(endpoints_geocoded[i],time_dist);
        L.polygon(poly_res, {color: 'red'}).addTo(map);
        polygs.push(poly_res);
        setPolygons(polygs);
      } catch (error) {
          console.error("failed request" + i);
      }
    }
    console.log(polygons);
  }

  async function getDriveTimePolygon(point, time)
  {
    const api_body = {
      req_type:2,
      lat:point[0],
      lng:point[1],
      time:time
    }
    let tasks_res = await fetch("http://localhost:8000/api", {
      method:"POST",
      body: JSON.stringify(api_body),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    let json_data = await tasks_res.json();
    return json_data;
  }

  async function getTasks()
  {
    let polys = polygons.map(subArray =>
      subArray.map(obj => [obj.lat, obj.lng])
    );
    console.log(polys);
    //0 means get tasks
    const api_body = {
      req_type:0,
      poly:polys
    }
    
    let tasks_res = await fetch("http://localhost:8000/api", {
      method:"POST",
      body: JSON.stringify(api_body),
      headers: {
        'Content-Type': 'application/json'
      }
    });//.then((value) => {console.log(value)}).catch((error) => {console.log(error)});
    //const whatwhat = await tasks.json();
    tasks_res = await tasks_res.json();
    //console.log(response);
    return tasks_res;
  }

  //GOOD CODE DON'T TOUCH
  //whatever you do don't touch this
  function clearEverything()
  {
    for (let i in map._layers) {
      if (i != 25 && map._layers[i].options.format == undefined) {
          try {
              map.removeLayer(map._layers[i]);
          } catch (e) {
              console.log("can't remove " + e + map._layers[i]);
          }
      }
    }
  }

  //Good Code Don't Touch
  function clearRoute() {
    for(let i = 0; i < endpoints.length; i++)
    {
      endpoints[i].current.value = '';
    }
    clearEverything();
    setPolygons([]);
    setTasks([]);
  }

  function clearAcceptedTasks() {
    setAcceptedTasks([]);
    setNumTasks(0);
  }

  if(!isLoaded) {
    return <div className="div-block">
      <p>Loading</p>
  </div>
  }
  return (
    <div className="App">
      <div>  
        <div className='tasks-div'>
        <p className='task-text'>Accepted Tasks: {numTasks}</p>
        <div>
          <label className="slider" htmlFor="countSlider">Drive Time: {time_dist}</label>
          <input
            type="range" id="countSlider" min={0} max={60} value={time_dist} onChange={handleSliderChange}
          />
        </div>
        <a className="find-tasks-button" onClick={() => findTasks() }>Find Tasks</a>
        <a className="clear-task-button" onClick={() => clearAcceptedTasks() }>Clear Accepted Tasks</a>
        </div>
        </div>
      <div className="div-block">
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} ref={setMap}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
          <GoogleMap
          zoom={8}
          center={L.latLng(center[0], center[1])}
          >
          </GoogleMap>    
      </div>
        <div className="destinations-div">
          {endpointComponents}
            <div className="div-block-2">
            <a className="button w-button" onClick={() => generateRoutes()}>Generate Routes</a>
            <a className="button-2 w-button" onClick={() => clearRoute() }>Clear</a>
            <a className="plus w-button" onClick={() => addDestination(arrLength, setArrLength)}>+</a>
            <a className="minus w-button" onClick={() => subtractDestination(arrLength, setArrLength)}>-</a>
            </div>
        </div>
        <TaskList/>
    </div>
  );
}

export default App;