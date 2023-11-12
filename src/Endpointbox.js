import {
    useJsApiLoader,
    GoogleMapProvider,
    GoogleMap,
    Marker,
    Autocomplete,
    DirectionsRenderer
  } from '@react-google-maps/api';

export default function Endpointbox({customKey, originRef}) 
{
  return (
    <div className="div-block-3">
        <Autocomplete>
          <input className="input_box" type='text' placeholder={`Location ${customKey}`} ref={originRef} />
        </Autocomplete>
    </div>
  );
}