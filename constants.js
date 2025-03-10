export const API_URL = '/api/proxy?url=https://kitchen.kanttiinit.fi';

export const DAYS = [
    'Maanantai',
    'Tiistai',
    'Keskiviikko',
    'Torstai',
    'Perjantai',
    'Lauantai',
    'Sunnuntai',
];

fetch(API_URL)
  .then(response => response.json())
  .then(data => {
    console.log('Data from the API:', data);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });