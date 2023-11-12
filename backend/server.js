const express = require("express");
const cors = require("cors");
const { DOMParser } = require('xmldom');
const { setKey, setDefaults, fromAddress } = require("react-geocode");
const {dotenv} = require("dotenv").config();

let tasklist = [];
//when you add tasks, they have to be in this format should contain name, origin, place, and text
//example tasks
tasklist.push(
    {
        name: "Max D",
        origin: "957 Filbert St, San Francisco, CA 94133",
        place: "Trader Joe's, 4th Street, San Francisco, CA",
        user_request: "Grocery List: 1. Hummus 2. Avocados 3. Cherry Tomatoes 4. Quinoa 5. Frozen Berries (e.g., mixed berries or blueberries) 6. Organic Brown Eggs"
    }
)
tasklist.push(
    {
        name: "Max B",
        origin: "Four Seasons Hotel San Francisco, Market Street, San Francisco, CA",
        place: "Trader Joe's, 4th Street, San Francisco, CA",
        user_request: "Get me some cookies!"
    }
);
tasklist.push(
    {
        name: "Bob C",
        origin: "816 Quarry Rd, San Francisco, CA",
        place: "Trader Joe's, 4th Street, San Francisco, CA",
        user_request: "Get me some crackers!"
    }
);
tasklist.push(
    {
        name: "Greg H",
        origin: "430 Baker St, San Francisco, CA",
        place: "Green Apple Books, 506 Clement St, San Francisco, CA",
        user_request: "Get me Diary of a Wimpy Kid: Rodrick Rules!"
    }
);
tasklist.push(
    {
        name: "Bob M",
        origin: "772 Portola St, San Francisco, CA",
        place: "Amoeba Music, 1855 Haight St, San Francisco, CA",
        user_request: "Get me a record of the album Uprising!"
    }
);
tasklist.push(
    {
        name: "Edna M",
        origin: "591 29th Ave, San Francisco, CA 94121",
        place: "Ross, 799 Market St, San Francisco, CA",
        user_request: "Get me a cool holloween costume! NO CAPES!!!"
    }
);
tasklist.push(
    {
        name: "Bob R",
        origin: "448 27th Ave, San Francisco, CA 94121",
        place: "Asakichi Antique, Arts, & Tea Ceremony Store, Post Street, San Francisco, CA",
        user_request: "Get me a tea set for my grandma!"
    }
);
tasklist.push(
    {
        name: "Stacy J",
        origin: "1914 29th Avenue, San Francisco, California",
        place: "Asakichi Antique, Arts, & Tea Ceremony Store, Post Street, San Francisco, CA",
        user_request: "Get me some oragami paper!"
    }
);
tasklist.push(
    {
        name: "Carlo M",
        origin: "1246 14th Avenue, San Francisco, California",
        place: "Stuart Hall High School, Octavia Street, San Francisco, CA",
        user_request: "Get me a teacher!"
    }
);

tasklist.push(
    {
        name: "Mathew M",
        origin: "1542 Broderick St, San Francisco, CA 94115",
        place: "Addys Hair Salon, Geary Street, San Francisco, CA",
        user_request: "Get me some hair spray!"
    }
);
tasklist.push(
    {
        name: "Jordan B",
        origin: "326 Funston Avenue, San Francisco, CA",
        place: "Walgreens, Divisadero Street, San Francisco, CA",
        user_request: "Get me some Advil!"

    }
);
tasklist.push(
    {
        name: "Jordan B",
        origin: "326 Funston Avenue, San Francisco, CA",
        place: "Walgreens, Divisadero Street, San Francisco, CA",
        user_request: "Get me some Advil!"

    }
);
tasklist.push(
    {
        name: "Sally R",
        origin: "1980 Jackson Street, San Francisco, CA",
        place: "Walgreens, Divisadero Street, San Francisco, CA",
        user_request: "Get me some listernine!"

    }
);
tasklist.push(
    {
        name: "Cameron G",
        origin: "1833 Laguna Street, San Francisco, CA",
        place: "S F Hardware, Divisadero Street, San Francisco, CA",
        user_request: "Get me some Hammers!!"

    }
);
tasklist.push(
    {
        name: "Sally R",
        origin: "427 Noe Street, San Francisco, CA",
        place: "Piano Finders, Embarcadero Center, San Francisco, CA",
        user_request: "Get me a yamaha piano!"

    }
);
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

function isTaskInside(x, y, polygon)
{
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][0], yi = polygon[i][1];
        const xj = polygon[j][0], yj = polygon[j][1];

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
}

async function getDriveTimePolygon(req)
{
    const userToken = process.env.INRIX_TOKEN;
    const apiUrl = `https://api.iq.inrix.com/drivetimePolygons?center=${req.body.lat}%7C${req.body.lng}&duration=${req.body.time}`;
    console.log(apiUrl);
    
    const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
        'accept': 'text/xml',
        'Authorization': 'Bearer ' + userToken
    }
    });
    const xmlString = await response.text();

    try{
        console.log(xmlString);
        // Parse the XML string using xmldom
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
        // Extract information from the parsed XML
        const posList = xmlDoc.getElementsByTagName('posList')[0].textContent;

        // Split the posList into individual coordinates
        const coordinates = posList.split(' ').map(parseFloat);

        // Separate the coordinates into latitude and longitude pairs
        const latLngPairs = [];
        for (let i = 0; i < coordinates.length; i += 2) {
            const lat = coordinates[i];
            const lng = coordinates[i + 1];
            latLngPairs.push({ lat, lng });
        }
        return latLngPairs;
    } catch (error) {
        if(req.body.time < 5)
            console.log("time too low");
        else
        {
            console.error("too many request trying again in 3 seconds");
            await new Promise(resolve => setTimeout(resolve, 3000));
            return await getDriveTimePolygon(req);
        }
    }
}

const app = express();

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json());

app.post("/api", async (req, res) => 
{
    //0 means the user wants to get tasks
    if(req.body.req_type == 0)
    {
        console.log("get tasks");
        console.log("request body is: ", req.body.poly);

        let response = [];
        for(let i = 0; i < tasklist.length; i++)
        {
            let task_place = await getGeocodedCoordsFromString(tasklist[i].place);
            for (const polyElement of req.body.poly) {
                console.log(polyElement);
                if (isTaskInside(task_place[0], task_place[1], polyElement)) {
                    response.push(tasklist[i]);
                    break;
                }
            }
        }

        //const response = tasklist;

        console.log(response);
        console.log("stringify", JSON.stringify(response));
        res.send(JSON.stringify(response));
    }
    //1 means the user wants to add tasks
    else if (req.body.req_type == 1) {
        console.log("add tasks");
        console.log("request body is: ", req.body);
        tasklist.push(req.body);
        console.log("taskList: " + tasklist);
    }
    else if (req.body.req_type == 2)
    {
        console.log("fetch polygon");
        console.log(req.body);
        
        let latLngPairs = await getDriveTimePolygon(req);
        
        // Send the latLngPairs back to the frontend
        res.send(latLngPairs);
    }
});

app.listen(8000, () => {
    console.log("server running on port 8000");
});