import assert from 'assert';
import { CalculatorService } from '../services/calculatorService.js';
import { GoalService } from '../services/goalService.js';

console.log('🧪 Starting service unit tests...');

// 1. CalculatorService Tests
try {
  console.log('\nRunning CalculatorService.calculate tests...');
  
  // Test case 1: Standard inputs
  const result1 = CalculatorService.calculate({
    transport: { car: 100, publicTransport: 50, flights: 10 },
    energy: { electricity: 200 },
    food: { habit: 'vegetarian' },
    waste: { generation: 10, recycled: true }
  });

  // Assert breakdown structure exists
  assert.ok(result1.totalEmissions > 0, 'Total emissions should be positive');
  assert.ok(result1.breakdown, 'Breakdown object should be returned');
  assert.strictEqual(typeof result1.breakdown.transport, 'number', 'Transport breakdown should be a number');
  assert.strictEqual(typeof result1.breakdown.energy, 'number', 'Energy breakdown should be a number');
  assert.strictEqual(typeof result1.breakdown.food, 'number', 'Food breakdown should be a number');
  assert.strictEqual(typeof result1.breakdown.waste, 'number', 'Waste breakdown should be a number');
  
  // Verify vegetarian food footprint
  assert.strictEqual(result1.breakdown.food, 1450, 'Vegetarian food emission should be 1450 kg CO2/year');

  // Test case 2: Vegan diet and recycling
  const result2 = CalculatorService.calculate({
    transport: { car: 0, publicTransport: 0, flights: 0 },
    energy: { electricity: 0 },
    food: { habit: 'vegan' },
    waste: { generation: 20, recycled: true }
  });

  assert.strictEqual(result2.breakdown.food, 950, 'Vegan food emission should be 950 kg CO2/year');
  // Waste calculation: 20 kg/week * 52 weeks * 0.5 kg CO2/kg * 0.6 recycling factor = 312 kg CO2/year
  assert.strictEqual(result2.breakdown.waste, 312, 'Recycled waste emissions matches calculation');
  assert.strictEqual(result2.totalEmissions, 950 + 312, 'Total emissions sums vegan diet + waste');

  console.log('✅ CalculatorService tests passed successfully.');
} catch (err) {
  console.error('❌ CalculatorService tests failed:', err.message);
  process.exit(1);
}

// 2. GoalService Tests
try {
  console.log('\nRunning GoalService.evaluate tests...');

  // Test case 1: Goal not achieved
  const eval1 = GoalService.evaluate(5, 10, 'energy');
  assert.strictEqual(eval1.completed, false, 'Goal of 5/10 should not be completed');
  assert.strictEqual(eval1.badge, null, 'Uncompleted goal should not award a badge');

  // Test case 2: Goal achieved (energy)
  const eval2 = GoalService.evaluate(15, 10, 'energy');
  assert.strictEqual(eval2.completed, true, 'Goal of 15/10 should be completed');
  assert.strictEqual(eval2.badge, 'Energy Saver', 'Energy category completion awards Energy Saver badge');

  // Test case 3: Goal achieved (transport)
  const eval3 = GoalService.evaluate(20, 20, 'transport');
  assert.strictEqual(eval3.completed, true, 'Goal of 20/20 should be completed');
  assert.strictEqual(eval3.badge, 'Green Commuter', 'Transport category completion awards Green Commuter badge');

  console.log('✅ GoalService tests passed successfully.');
} catch (err) {
  console.error('❌ GoalService tests failed:', err.message);
  process.exit(1);
}

console.log('\n🎉 All unit tests passed successfully!');
process.exit(0);
