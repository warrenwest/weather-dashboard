// server/src/routes/api/weatherRoutes.ts
import { Router } from 'express';
import WeatherService from '../../service/weatherService.js';
import HistoryService from '../../service/historyService.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required.' });
    }
    const weatherData = await WeatherService.getWeatherForCity(city);
    await HistoryService.addCity(city);
    return res.json(weatherData);
  } catch (error) {
    console.error('POST / error:', error);
    return res.status(500).json({ error: 'Failed to retrieve weather data.' });
  }
});

router.get('/history', async (_req, res) => {
  try {
    const history = await HistoryService.getCities();
    res.json(history); // ✅ ensure this is JSON!
  } catch (error) {
    console.error('Error in GET /history:', error);
    res.status(500).json({ error: 'Failed to retrieve search history.' });
  }
});


router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await HistoryService.removeCity(id);
    res.status(200).json({ message: `City with ID "${id}" removed.` });
  } catch (error) {
    console.error('DELETE /history/:id error:', error);
    res.status(500).json({ error: 'Failed to delete city from history.' });
  }
});

export default router;
