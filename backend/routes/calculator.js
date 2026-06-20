import express from 'express';
import { DB } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate total emissions in kg CO2/year
const calculateCarbonScore = (data) => {
  const { transport, energy, food, waste } = data;

  // 1. Transportation
  const carEmissions = (transport.car || 0) * 52 * 0.120; // 120g CO2/km
  const bikeEmissions = 0; // 0g CO2/km
  const publicTransportEmissions = (transport.publicTransport || 0) * 52 * 0.040; // 40g CO2/passenger-km
  const flightEmissions = (transport.flights || 0) * 90; // ~90kg CO2 per flight hour
  const transportTotal = carEmissions + bikeEmissions + publicTransportEmissions + flightEmissions;

  // 2. Energy
  const electricityEmissions = (energy.electricity || 0) * 12 * 0.450; // 450g CO2/kWh
  const energyTotal = electricityEmissions;

  // 3. Food
  let foodTotal = 2200; // Moderate meat default
  if (food.habit === 'vegan') foodTotal = 950;
  if (food.habit === 'vegetarian') foodTotal = 1450;
  if (food.habit === 'heavy-meat') foodTotal = 3100;

  // 4. Waste
  let wasteEmissions = (waste.generation || 0) * 52 * 0.5; // 0.5kg CO2/kg of waste landfill
  if (waste.recycled) {
    wasteEmissions = wasteEmissions * 0.6; // 40% reduction from recycling
  }
  const wasteTotal = wasteEmissions;

  // Sum everything
  const total = transportTotal + energyTotal + foodTotal + wasteTotal;

  return {
    totalEmissions: Math.round(total),
    breakdown: {
      transport: Math.round(transportTotal),
      energy: Math.round(energyTotal),
      food: Math.round(foodTotal),
      waste: Math.round(wasteTotal)
    }
  };
};

// @route   POST /api/calculator
// @desc    Calculate and save a new footprint entry
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { transport, energy, food, waste } = req.body;

    if (!transport || !energy || !food || !waste) {
      return res.status(400).json({ message: 'Missing calculator fields.' });
    }

    const { totalEmissions, breakdown } = calculateCarbonScore({ transport, energy, food, waste });

    const newFootprint = await DB.footprints.create(req.user.id, {
      transport,
      energy,
      food,
      waste,
      totalEmissions
    });

    // Award 50 eco-points for logging carbon footprint
    const updatedUser = await DB.users.addPoints(req.user.id, 50);

    res.status(201).json({
      footprint: newFootprint,
      breakdown,
      userPoints: updatedUser ? updatedUser.ecoPoints : 0,
      message: 'Carbon footprint logged successfully! You earned 50 eco-points! 🌱'
    });

  } catch (err) {
    console.error('Carbon calculation error:', err);
    res.status(500).json({ message: 'Server error saving carbon footprint.' });
  }
});

// @route   GET /api/calculator/history
// @desc    Get user footprint history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await DB.footprints.getByUserId(req.user.id);
    res.json(history);
  } catch (err) {
    console.error('Fetch carbon history error:', err);
    res.status(500).json({ message: 'Server error fetching history.' });
  }
});

export default router;
