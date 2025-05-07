import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch'; // or use global fetch in modern Node.js
// You may need: npm install node-fetch

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  constructor(
    public temperature: number,
    public description: string,
    public icon: string,
    public timestamp: number
  ) {}
}

// Define the WeatherService class
class WeatherService {
  private baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
  private apiKey = process.env.API_KEY || '';
  private city: string = '';

  // Fetch location data using geocoding
  private async fetchLocationData(query: string) {
    const url = `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch location data: ${res.statusText}`);
    const data = await res.json() as any[];
    if (!data[0]) throw new Error(`No location data found for "${query}"`);
    return data[0];
  }

  // Extract lat/lon
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // Build query string for geocoding
  private buildGeocodeQuery(): string {
    return this.city;
  }

  // Build query string for weather endpoint
  private buildWeatherQuery({ lat, lon }: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
  }

  // Combines fetch and destructure for location
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery();
    const locationData = await this.fetchLocationData(query);
    return this.destructureLocationData(locationData);
  }

  // Fetch weather forecast data
  private async fetchWeatherData(coordinates: Coordinates) {
    const url = this.buildWeatherQuery(coordinates);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch weather data: ${res.statusText}`);
    return await res.json() as { list: any[] }; // Explicitly type the response
  }

  // Extract current weather info from API response
  private parseCurrentWeather(response: any): Weather {
    const current = response.list[0];
    return new Weather(
      current.main.temp,
      current.weather[0].description,
      current.weather[0].icon,
      current.dt
    );
  }

  // Create an array of Weather instances for forecast
  private buildForecastArray(_currentWeather: Weather, weatherData: any[]): Weather[] {
    const forecastList = weatherData.slice(1, 6); // example: next 5 entries
    return forecastList.map(item => new Weather(
      item.main.temp,
      item.weather[0].description,
      item.weather[0].icon,
      item.dt
    ));
  }

  // Public method to get full weather data for a city
  async getWeatherForCity(city: string) {
    this.city = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherResponse = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherResponse);
    const forecast = this.buildForecastArray(currentWeather, weatherResponse.list);
    return {
      location: city,
      current: currentWeather,
      forecast,
    };
  }
}

export default new WeatherService();
