import fs from 'fs';
import path from 'path';

// Correct the path to the `searchHistory.json` in db
const historyFilePath = path.resolve('server/db/searchHistory.json');

// Read the file and parse it into an array of cities
async function read() {
  const data = fs.readFileSync(historyFilePath, 'utf-8');
  return JSON.parse(data);
}

// Write the updated cities array back to the file
async function write(cities: any[]) {
  fs.writeFileSync(historyFilePath, JSON.stringify(cities, null, 2), 'utf-8');
}

async function getCities() {
  try {
    const cities = await read();
    return cities;
  } catch (error) {
    console.error('Error reading search history:', error);
    throw new Error('Failed to retrieve search history.');
  }
}

async function addCity(city: string) {
  const cities = await getCities();
  const newCity = { id: Date.now().toString(), name: city };
  cities.push(newCity);
  await write(cities);
}

async function removeCity(id: string) {
  let cities = await getCities();
  cities = cities.filter((city: any) => city.id !== id);
  await write(cities);
}

export default { getCities, addCity, removeCity };
