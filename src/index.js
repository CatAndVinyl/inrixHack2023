import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import L from "leaflet";
import { setKey, setDefaults, fromAddress } from "react-geocode";

async function getGeocodedCoordsFromString(address)
{
  setDefaults({
    key: "AIzaSyD7ybO9gWjqZTjNv1CpitYk70ry_ZWZvOg", // Your API key here.
  });

  //console.log(await fromAddress(addresses[i].current.value));
  const response = await fromAddress(address);
  const {results} = response;
  const {lat, lng} = results[0].geometry.location;
  return([lat, lng]);
}

async function getGeocodedCoords(addresses)
{
  setDefaults({
    key: "AIzaSyD7ybO9gWjqZTjNv1CpitYk70ry_ZWZvOg", // Your API key here.
  });

  let res = [];
  for(let i = 0; i < addresses.length; i++)
  {
    const response = await fromAddress(addresses[i].current.value);
    const {results} = response;
    const {lat, lng} = results[0].geometry.location;
    res.push([lat, lng]);
  }
  return res;
}

//Good Code Don't Touch
function addDestination(count, updateFunction) {
  updateFunction(count + 1);
}

//Good Code Don't Touch
function subtractDestination(count, updateFunction) {
  if(count > 2)
    updateFunction(count - 1);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App getGeocodedCoords={getGeocodedCoords} getGeocodedCoordsFromString={getGeocodedCoordsFromString}
    addDestination={addDestination} subtractDestination={subtractDestination}
    />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();