/**
 * Service to handle carbon footprint mathematical calculations.
 * Completely isolated from request/response objects for high testability.
 */
export class CalculatorService {
  /**
   * Calculates total carbon emissions and categories breakdown in kg CO2/year.
   * 
   * @param {Object} data - Input metrics
   * @param {Object} data.transport - Commuting details
   * @param {number} data.transport.car - km/week
   * @param {number} data.transport.bike - km/week
   * @param {number} data.transport.publicTransport - km/week
   * @param {number} data.transport.flights - hours/year
   * @param {Object} data.energy - Home energy metrics
   * @param {number} data.energy.electricity - kWh/month
   * @param {Object} data.food - Diet habits
   * @param {string} data.food.habit - vegan, vegetarian, moderate-meat, heavy-meat
   * @param {Object} data.waste - Municipal waste metrics
   * @param {number} data.waste.generation - kg/week
   * @param {boolean} data.waste.recycled - recycling status
   * 
   * @returns {Object} { totalEmissions, breakdown }
   */
  static calculate(data) {
    const { transport = {}, energy = {}, food = {}, waste = {} } = data;

    // 1. Transportation
    const carEmissions = (parseFloat(transport.car) || 0) * 52 * 0.120; // 120g CO2/km
    const ptEmissions = (parseFloat(transport.publicTransport) || 0) * 52 * 0.040; // 40g CO2/passenger-km
    const flightEmissions = (parseFloat(transport.flights) || 0) * 90; // ~90kg CO2 per flight hour
    const transportTotal = carEmissions + ptEmissions + flightEmissions;

    // 2. Energy
    const energyTotal = (parseFloat(energy.electricity) || 0) * 12 * 0.450; // 450g CO2/kWh

    // 3. Food
    let foodTotal = 2200; // Moderate meat default
    const habit = String(food.habit || '').toLowerCase();
    if (habit === 'vegan') foodTotal = 950;
    else if (habit === 'vegetarian') foodTotal = 1450;
    else if (habit === 'heavy-meat') foodTotal = 3100;

    // 4. Waste
    let wasteEmissions = (parseFloat(waste.generation) || 0) * 52 * 0.5; // 0.5kg CO2/kg of waste landfill
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
  }
}
