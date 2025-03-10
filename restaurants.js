///////////// OTANIEMI MENUS BY KURKI ///////////////

/*
 * To fetch restaurant information and menus from kanttiinit.fi API.
 *
 * Base URL of the API: https://kitchen.kanttiinit.fi, found in the constant API_URL in constants.js.
 *
 * //// Useful endpoints ////
 *
 * GET https://kitchen.kanttiinit.fi/restaurants?ids=ID1,ID2,ID3
 * Returns restaurant information based on IDs.
 *
 * GET https://kitchen.kanttiinit.fi/restaurants/ID/menu
 * Returns the menu and other information of a single restaurant.
 *
 * GET https://kitchen.kanttiinit.fi/areas?idsOnly=1&lang=fi
 * Lists restaurants by area based on IDs.
 *
 * GET /restaurants?location=LAT,LON
 * Returns the nearest restaurant based on location.
 *
 */


// Import constants from constants.js.

import { API_URL, DAYS } from './constants.js';


// Fetch restaurant information in HTML.
// The function is called by giving it the restaurant ID. If no ID is given, 2 (TTalo) is used by default.

async function fetchRestaurantInfo(id = 2) {
    const response = await fetch(
        `${API_URL}/restaurants?ids=${id}`
    );
    if (!response.ok) {
        throw new Error('API call is invalid');
    }
    // The response returns headers and other information.
    // Now we want the data, which comes in JSON format.
    // Parse it here using the response.json() method.
    const data = await response.json();
    console.log(data);
    return data[0];
}


// Format the address and today's opening hours of Tietotekniikantalo in an HTML element.

function renderRestaurantHours(restaurant) {
    // First, render the restaurant name.
    const hoursContainer = document.getElementById('restaurant-hours');
    hoursContainer.innerHTML = '';

    // Create a new h2 heading. The element can be any HTML text element.
    const otsikko = document.createElement('h2');
    otsikko.innerHTML = restaurant.name;
    // Add the heading to the HTML.
    document.getElementById('restaurant-hours').appendChild(otsikko);
    // Iterate through the DAYS constant and create opening hours in HTML.
    DAYS.forEach((day, index) => {
        const aukiolo = document.createElement('div');
        aukiolo.classList.add('hours-row');
        const openingHours = restaurant.openingHours[index] || 'Not open'; 

        aukiolo.innerHTML = `
          <span>${day}</span>
          <span>${openingHours}</span>`;
        
        document.getElementById('restaurant-hours').appendChild(aukiolo);
    });

    // Add the address to the HTML based on the data.
    const osoite = document.createElement('div');
    osoite.classList.add('hours-row');
    osoite.innerHTML = `Address: ${restaurant.address || 'No data'}`;
    document.getElementById('restaurant-hours').appendChild(osoite);
}


// Fetch the menu of Tietotekniikantalo for today.

async function fetchMenu(id = 2) {
    const response = await fetch(
        `${API_URL}/restaurants/${id}/menu?lang=en`
    );
    if (!response.ok) {
        throw new Error('API call is invalid');
    }
    const data = await response.json();
    console.log(data);
    const menuData = data;
    console.log(menuData);

    return menuData;
}


// Format the restaurant's daily menu in an HTML element.
// menuData is an object where "menus" is an array containing the daily menus.
// Each menu object has a "day" (YYYY-MM-DD) which indicates the date of the daily menu.
// Additionally, "courses" is an array that contains the dishes.

function renderMenu(menuData) {
    const menuContainer = document.getElementById('restaurant-menu');
    menuContainer.innerHTML = '';

    if (!menuData || !menuData.menus) {
        menuContainer.innerHTML = '<p>No menu data available for today.</p>';
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    const todayMenu = menuData.menus.find(menu => menu.day === today);

    if (!todayMenu || !todayMenu.courses || todayMenu.courses.length === 0) {
        menuContainer.innerHTML = '<p>No menu data available for today.</p>';
        return;
    }

    todayMenu.courses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.classList.add('menu-item');
        courseElement.textContent = course.title;
        menuContainer.appendChild(courseElement);
    });
}


// Fetch all restaurants in Otaniemi and update the dropdown menu.

async function fetchAllRestaurants() {
    try {
        const areasResponse = await fetch(`${API_URL}/areas?idsOnly=1&lang=fi`); 
        if (!areasResponse.ok) {
            throw new Error("Error fetching areas");
        }
        const areasData = await areasResponse.json();

        const areaNames = areasData.map(area => area.name);
        console.log("All area names:", areaNames);

        const otaniemiArea = areasData.find(area => area.name.toLowerCase() === "otaniemi");
        console.log("All Otaniemi area data:", otaniemiArea);
        if (!otaniemiArea) {
            throw new Error("Can't find Otaniemi area");
        }
        // Select the restaurant IDs from the Otaniemi area and sort them.
        const otaniemiAreaRestaurantIds = otaniemiArea.restaurants.sort((a, b) => (a === 2 ? -1 : b === 2 ? 1 : 0));;
        console.log("All Otaniemi area ids:", otaniemiAreaRestaurantIds);
        return otaniemiAreaRestaurantIds;
    } catch (error) {
        console.error(error);
        return [];
    }

}


// Add the names of Otaniemi restaurants to the #restaurant-dropdown menu.
// Update the information when a new restaurant is selected from the menu.

async function updateRestaurantDropdown(otaniemiAreaRestaurantIds) {
        const response = await fetch(`${API_URL}/restaurants?ids=${otaniemiAreaRestaurantIds.join(',')}`);
        // to get all data since the API does not have a specific endpoint for Otaniemi
        if (!response.ok) {
            throw new Error('API call is invalid');
        }
        const data = await response.json();
        console.log(data);
    
        const dropdown = document.getElementById('restaurant-dropdown');
        dropdown.innerHTML = '';
    
        data.forEach(restaurant => {
            const option = document.createElement('option');
            option.value = restaurant.id;
            option.textContent = restaurant.name;
            dropdown.appendChild(option);
        });
    
        dropdown.addEventListener('change', async (event) => {
            const selectedRestaurantId = event.target.value;
            console.log('Selected restaurant:', selectedRestaurantId);
            await updateSelectedRestaurant(selectedRestaurantId);
        });
}


// Update the selected restaurant's information and menu.

async function updateSelectedRestaurant(restaurantId) {
    try {
        const resInfo = await fetchRestaurantInfo(restaurantId);
        renderRestaurantHours(resInfo);

        const menuData = await fetchMenu(restaurantId);
        console.log("Fetched menu data:", JSON.stringify(menuData, null, 2));
        renderMenu(menuData, restaurantId);
    } catch (error) {
        console.error("Error fetching restaurant information:", error);
    }
}


// Fetch the nearest restaurant based on the user's location. 
// Use the browser's geolocation API and the endpoint https://kitchen.kanttiinit.fi/restaurants?location=LAT,LON

function getLocation() {
    if (!navigator.geolocation) {
        console.error('Geolocation is not supported by this browser.');
        document.getElementById('nearest-restaurant').innerHTML = '<p class="error-message">Geolocation is not supported by this browser.</p>';
        return;
    }
    // The browser's geolocation API returns the user's location asynchronously.
    // It calls the findNearestRestaurants function when the location is fetched.
    navigator.geolocation.getCurrentPosition(
        (position) => { findNearestRestaurants(position);
        },
        (error) => {
            console.error('Error getting location:', error);
            let errorMessage = '';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'User denied the request for Geolocation.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'The request to get user location timed out.';
                    break;
                case error.UNKNOWN_ERROR:
                    errorMessage = 'An unknown error occurred.';
                    break;
            }
            document.getElementById('nearest-restaurant').innerHTML = `<p class="error-message">${errorMessage}</p>`;
        });
}


// Find the nearest restaurant based on the user's location.

async function findNearestRestaurants(position) {
    console.log('Position:', position);
    const { latitude, longitude } = position.coords;

    const response = await fetch(
        `${API_URL}/restaurants?location=${latitude},${longitude}`
    );
    if (!response.ok) {
        console.error('Error fetching nearest restaurant');
        document.getElementById('nearest-restaurant').innerHTML = '<p>Error fetching nearest restaurant.</p>';
        return;
    }
    const data = await response.json();
    console.log(data);
    if (data.length === 0) {
        document.getElementById('nearest-restaurant').innerHTML = '<p>No nearby restaurants found.</p>';
        return;
    }
    const nearestRestaurant = data[0];
    document.getElementById('nearest-restaurant').innerHTML = `
      <p>Coordinates: ${latitude}, ${longitude}</p>
      <p>Distance: ${nearestRestaurant.distance}m</p>
      <p>Name: ${nearestRestaurant.name}</p>
      <p>Address: ${nearestRestaurant.address}</p>`;
}


// Create a main function that calls other functions we have made.

async function main() {
    // Fetch restaurant information and update it on the page using the renderRestaurantHours function
    const ravintolaInfo = await fetchRestaurantInfo(2);
    console.log(ravintolaInfo);
    renderRestaurantHours(ravintolaInfo);

    // Fetch all restaurants and update the dropdown (tasks 5 and 6).
    // Also fetch the menu of the first restaurant.
    const allRestaurants = await fetchAllRestaurants();
    console.log(allRestaurants);
    updateRestaurantDropdown(allRestaurants);

    const firstRestaurantId = allRestaurants.length > 0 ? allRestaurants[0].id : 2;

    const menuData = await fetchMenu(firstRestaurantId);
    renderMenu(menuData, firstRestaurantId);

    // Fetch the nearest restaurant.

    document
        .getElementById('location-button')
        ?.addEventListener('click', () => {
            getLocation();
        });
}

main();
