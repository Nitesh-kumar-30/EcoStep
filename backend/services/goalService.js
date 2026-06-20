/**
 * Service to handle Goal reduction logic and Milestone Badge selections.
 * Isolated for high testing support.
 */
export class GoalService {
  /**
   * Evaluates if a goal has been accomplished and determines the appropriate badge.
   * 
   * @param {number} currentValue - User's current logged reduction progress
   * @param {number} targetValue - User's defined goal target reduction percentage
   * @param {string} category - Goal category (transport, energy, food, waste)
   * 
   * @returns {Object} { completed, badge }
   */
  static evaluate(currentValue, targetValue, category) {
    const current = parseFloat(currentValue) || 0;
    const target = parseFloat(targetValue) || 0;
    const completed = current >= target;

    let badge = null;
    if (completed) {
      switch (String(category || '').toLowerCase()) {
        case 'transport':
          badge = 'Green Commuter';
          break;
        case 'energy':
          badge = 'Energy Saver';
          break;
        case 'food':
          badge = 'Food Defender';
          break;
        case 'waste':
          badge = 'Waste Warrior';
          break;
        default:
          badge = 'Earth Guardian';
      }
    }

    return { completed, badge };
  }
}
