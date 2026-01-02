/**
 * Financial calculation utilities for the FI calculator
 */

export interface FinancialInputs {
  currentIncome: number;
  monthlyExpenses: number;
  currentSavings: number; // Cash/Bank savings
  currentInvestments?: number; // Stock/Bond investments
  targetFINumber: number;
  timeHorizon: number; // in years
  annualReturn: number; // as decimal (e.g., 0.07 for 7%)
  inflationRate: number; // as decimal (e.g., 0.03 for 3%)
  monthlySavings?: number; // optional, amount saved monthly (no returns)
  monthlyInvestment?: number; // optional, amount invested monthly (with returns)
  savingsInterestRate?: number; // optional, interest rate for savings
}

export interface CalculationResults {
  requiredMonthlySavings: number;
  futureValueOfCurrentSavings: number;
  inflationAdjustedFINumber: number;
  yearsToFI: number;
  monthsToFI: number;
  totalMonthsToFI: number;
  // Time-based mode results
  calculatedFINumber?: number;
  baseFINumber?: number;
  suggestedMonthlySavings?: number;
  suggestedMonthlyInvestment?: number;
  totalFutureSavings?: number;
  totalFutureInvestment?: number;
  targetAtCompletion?: number;
}

/**
 * Calculate future value using compound interest formula
 * FV = PV × (1 + r)^n
 */
export function calculateFutureValue(
  principal: number,
  annualRate: number,
  years: number
): number {
  return principal * Math.pow(1 + annualRate, years);
}

/**
 * Calculate required monthly savings to reach a target amount
 * Uses the future value of an annuity formula
 * FV = PMT × [((1 + r)^n - 1) / r]
 * Solving for PMT: PMT = FV × r / ((1 + r)^n - 1)
 */
export function calculateRequiredMonthlySavings(
  targetAmount: number,
  currentSavings: number,
  annualRate: number,
  years: number
): number {
  // Calculate future value of current savings
  const futureValueOfSavings = calculateFutureValue(
    currentSavings,
    annualRate,
    years
  );

  // Amount still needed after current savings grow
  const amountNeeded = targetAmount - futureValueOfSavings;

  if (amountNeeded <= 0) {
    return 0; // Already have enough
  }

  // Convert annual rate to monthly
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;

  // Calculate monthly payment needed
  const denominator = Math.pow(1 + monthlyRate, totalMonths) - 1;

  if (denominator === 0) {
    // If rate is 0, simple division
    return amountNeeded / totalMonths;
  }

  return (amountNeeded * monthlyRate) / denominator;
}

/**
 * Adjust an amount for inflation
 * Adjusted = Amount × (1 + i)^n
 */
export function calculateInflationAdjustedAmount(
  amount: number,
  inflationRate: number,
  years: number
): number {
  return amount * Math.pow(1 + inflationRate, years);
}

/**
 * Calculate timeline to reach FI given monthly savings
 * Solves for n in: FV = PV(1+r)^n + PMT × [((1 + r)^n - 1) / r]
 */
export function calculateTimelineToFI(
  currentSavings: number,
  monthlySavings: number,
  targetAmount: number,
  annualRate: number
): { years: number; months: number; totalMonths: number } {
  const monthlyRate = annualRate / 12;

  // If no monthly savings, check if current savings will grow to target
  if (monthlySavings === 0) {
    if (currentSavings >= targetAmount) {
      return { years: 0, months: 0, totalMonths: 0 };
    }
    if (monthlyRate === 0) {
      return { years: Infinity, months: Infinity, totalMonths: Infinity };
    }
    const months = Math.log(targetAmount / currentSavings) / Math.log(1 + monthlyRate);
    return {
      totalMonths: Math.ceil(months),
      years: Math.floor(months / 12),
      months: Math.ceil(months % 12),
    };
  }

  // Binary search for the number of months
  let low = 0;
  let high = 1200; // Max 100 years
  let result = high;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const futureValue =
      currentSavings * Math.pow(1 + monthlyRate, mid) +
      monthlySavings * ((Math.pow(1 + monthlyRate, mid) - 1) / monthlyRate);

    if (futureValue >= targetAmount) {
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return {
    totalMonths: result,
    years: Math.floor(result / 12),
    months: result % 12,
  };
}

/**
 * Main calculation function
 */
export function calculateFinancialIndependence(
  inputs: FinancialInputs,
  mode: 'goal-based' | 'time-based' | 'contribution-based' = 'goal-based'
): CalculationResults {
  if (mode === 'time-based') {
    return calculateTimeBasedStrategy(inputs);
  }

  if (mode === 'contribution-based') {
    return calculateContributionTimeline(inputs);
  }
  
  // Goal-based mode
  
  // 1. Calculate FV of current assets
  const futureValueOfCash = calculateFutureValue(
    inputs.currentSavings,
    inputs.savingsInterestRate || 0,
    inputs.timeHorizon
  );

  const futureValueOfInvestments = calculateFutureValue(
    inputs.currentInvestments || 0,
    inputs.annualReturn,
    inputs.timeHorizon
  );

  const futureValueOfCurrentSavings = futureValueOfCash + futureValueOfInvestments;

  // 2. Target is ALREADY inflation adjusted (as per user request)
  // So we don't inflate it further.
  const inflationAdjustedFINumber = inputs.targetFINumber;

  // 3. Calculate required monthly savings
  const amountNeeded = inflationAdjustedFINumber - futureValueOfCurrentSavings;
  
  let requiredMonthlyTotal = 0;
  let suggestedMonthlySavings = 0;
  let suggestedMonthlyInvestment = 0;
  let totalFutureSavings = futureValueOfCash;
  let totalFutureInvestment = futureValueOfInvestments;

  if (amountNeeded > 0) {
    const savingsRate = (inputs.savingsInterestRate || 0) / 12;
    const investmentRate = inputs.annualReturn / 12;
    const months = inputs.timeHorizon * 12;
    
    const fvFactorSavings = (Math.pow(1 + savingsRate, months) - 1) / savingsRate;
    const fvFactorInvestment = (Math.pow(1 + investmentRate, months) - 1) / investmentRate;
    
    const combinedFactor = (0.3 * fvFactorSavings) + (0.7 * fvFactorInvestment);
    
    requiredMonthlyTotal = amountNeeded / combinedFactor;
    
    suggestedMonthlySavings = requiredMonthlyTotal * 0.3;
    suggestedMonthlyInvestment = requiredMonthlyTotal * 0.7;
    
    // Calculate total future values
    totalFutureSavings += suggestedMonthlySavings * fvFactorSavings;
    totalFutureInvestment += suggestedMonthlyInvestment * fvFactorInvestment;
  } else {
    // If no extra needed, we still project current assets?
    // Or if amountNeeded <= 0, it means current assets > target.
    // We can just leave totals as FV of current assets.
  }

  const yearsToFI = amountNeeded <= 0 ? 0 : inputs.timeHorizon;

  return {
    requiredMonthlySavings: requiredMonthlyTotal,
    futureValueOfCurrentSavings,
    inflationAdjustedFINumber,
    yearsToFI: yearsToFI,
    monthsToFI: 0,
    totalMonthsToFI: yearsToFI * 12,
    suggestedMonthlySavings,
    suggestedMonthlyInvestment,
    totalFutureSavings,
    totalFutureInvestment,
  };
}

/**
 * Calculate strategy based on time horizon (time-based mode)
 */
function calculateTimeBasedStrategy(inputs: FinancialInputs): CalculationResults {
  // Calculate Base FI number (Year 0) based on monthly expenses (25x annual expenses rule)
  const baseFINumber = inputs.monthlyExpenses * 12 * 25;
  
  // Calculate Future FI number (Year N) adjusted for inflation
  const futureFINumber = calculateInflationAdjustedAmount(
    baseFINumber,
    inputs.inflationRate,
    inputs.timeHorizon
  );
  
  // Calculate FV of current assets
  const futureValueOfCash = calculateFutureValue(
    inputs.currentSavings,
    inputs.savingsInterestRate || 0,
    inputs.timeHorizon
  );

  const futureValueOfInvestments = calculateFutureValue(
    inputs.currentInvestments || 0,
    inputs.annualReturn,
    inputs.timeHorizon
  );
  
  const futureValueOfCurrentAssets = futureValueOfCash + futureValueOfInvestments;
  
  // Gap to fill
  const gap = futureFINumber - futureValueOfCurrentAssets;
  
  let requiredMonthlySavings = 0;
  let totalFutureSavings = futureValueOfCash;
  let totalFutureInvestment = futureValueOfInvestments;
  
  if (gap > 0) {
    const savingsRate = (inputs.savingsInterestRate || 0) / 12;
    const investmentRate = inputs.annualReturn / 12;
    const months = inputs.timeHorizon * 12;
    
    const fvFactorSavings = (Math.pow(1 + savingsRate, months) - 1) / savingsRate;
    const fvFactorInvestment = (Math.pow(1 + investmentRate, months) - 1) / investmentRate;
    
    const combinedFactor = (0.3 * fvFactorSavings) + (0.7 * fvFactorInvestment);
    
    requiredMonthlySavings = gap / combinedFactor;
    
    // Calculate total future values including contributions
    totalFutureSavings += (requiredMonthlySavings * 0.3) * fvFactorSavings;
    totalFutureInvestment += (requiredMonthlySavings * 0.7) * fvFactorInvestment;
  }
  
  const suggestedMonthlyInvestment = requiredMonthlySavings * 0.7;
  const suggestedMonthlySavings = requiredMonthlySavings * 0.3;
  
  return {
    requiredMonthlySavings,
    futureValueOfCurrentSavings: futureValueOfCurrentAssets,
    inflationAdjustedFINumber: futureFINumber,
    yearsToFI: inputs.timeHorizon,
    monthsToFI: 0,
    totalMonthsToFI: inputs.timeHorizon * 12,
    calculatedFINumber: futureFINumber,
    baseFINumber: baseFINumber,
    suggestedMonthlySavings,
    suggestedMonthlyInvestment,
    totalFutureSavings,
    totalFutureInvestment,
  };
}

function calculateContributionTimeline(inputs: FinancialInputs): CalculationResults {
  const monthlySavingsContribution = inputs.monthlySavings || 0;
  const monthlyInvestmentContribution = inputs.monthlyInvestment || 0;

  const monthlySavingsRate = (inputs.savingsInterestRate || 0) / 12;
  const monthlyInvestmentRate = inputs.annualReturn / 12;
  const monthlyInflationRate = Math.pow(1 + inputs.inflationRate, 1 / 12) - 1;

  const baseTarget = inputs.targetFINumber || inputs.monthlyExpenses * 12 * 25;

  const projectPortfolio = (months: number) => {
    const targetAtMonth = baseTarget * Math.pow(1 + monthlyInflationRate, months);

    const savingsFutureValue =
      monthlySavingsRate === 0
        ? inputs.currentSavings + monthlySavingsContribution * months
        : inputs.currentSavings * Math.pow(1 + monthlySavingsRate, months) +
          monthlySavingsContribution * ((Math.pow(1 + monthlySavingsRate, months) - 1) / monthlySavingsRate);

    const investmentsFutureValue =
      monthlyInvestmentRate === 0
        ? (inputs.currentInvestments || 0) + monthlyInvestmentContribution * months
        : (inputs.currentInvestments || 0) * Math.pow(1 + monthlyInvestmentRate, months) +
          monthlyInvestmentContribution * ((Math.pow(1 + monthlyInvestmentRate, months) - 1) / monthlyInvestmentRate);

    return {
      total: savingsFutureValue + investmentsFutureValue,
      target: targetAtMonth,
      savingsFutureValue,
      investmentsFutureValue,
    };
  };

  const startingPosition = projectPortfolio(0);
  if (startingPosition.total >= startingPosition.target) {
    return {
      requiredMonthlySavings: monthlySavingsContribution + monthlyInvestmentContribution,
      futureValueOfCurrentSavings: startingPosition.total,
      inflationAdjustedFINumber: startingPosition.target,
      yearsToFI: 0,
      monthsToFI: 0,
      totalMonthsToFI: 0,
      suggestedMonthlySavings: monthlySavingsContribution,
      suggestedMonthlyInvestment: monthlyInvestmentContribution,
      totalFutureSavings: startingPosition.savingsFutureValue,
      totalFutureInvestment: startingPosition.investmentsFutureValue,
      targetAtCompletion: startingPosition.target,
      baseFINumber: baseTarget,
    };
  }

  let low = 0;
  let high = 1200; // up to 100 years
  let result = high;
  let found = false;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const projection = projectPortfolio(mid);

    if (projection.total >= projection.target) {
      found = true;
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  const completion = projectPortfolio(result);
  const yearsToFI = Math.floor(result / 12);
  const monthsToFI = result % 12;

  return {
    requiredMonthlySavings: monthlySavingsContribution + monthlyInvestmentContribution,
    futureValueOfCurrentSavings: completion.total,
    inflationAdjustedFINumber: completion.target,
    yearsToFI: found ? yearsToFI : Infinity,
    monthsToFI: found ? monthsToFI : 0,
    totalMonthsToFI: found ? result : Infinity,
    suggestedMonthlySavings: monthlySavingsContribution,
    suggestedMonthlyInvestment: monthlyInvestmentContribution,
    totalFutureSavings: completion.savingsFutureValue,
    totalFutureInvestment: completion.investmentsFutureValue,
    targetAtCompletion: completion.target,
    baseFINumber: baseTarget,
  };
}

/**
 * Generate year-by-year projection data for charting
 */
export function generateTimelineData(
  inputs: FinancialInputs, 
  mode: 'goal-based' | 'time-based' | 'contribution-based' = 'goal-based',
  results?: CalculationResults
): Array<{
  year: number;
  savings: number;
  target: number;
}> {
  const data: Array<{ year: number; savings: number; target: number }> = [];
  
  // Rates
  const monthlyInvestmentRate = inputs.annualReturn / 12;
  const monthlySavingsRate = (inputs.savingsInterestRate || 0) / 12;
  
  // Determine monthly contributions
  let monthlySavingsContribution = 0;
  let monthlyInvestmentContribution = 0;
  let targetAmount = inputs.targetFINumber;

  if (results) {
    // Use suggested amounts from results for BOTH modes now
    monthlySavingsContribution = results.suggestedMonthlySavings || 0;
    monthlyInvestmentContribution = results.suggestedMonthlyInvestment || 0;
    
    if (mode === 'time-based') {
      // For the chart, we want the moving target line.
      // We start with the base (Year 0) amount and inflate it each year in the loop.
      targetAmount = results.baseFINumber || (inputs.monthlyExpenses * 12 * 25);
    }
  }

  let investedValue = inputs.currentInvestments || 0; // Amount that grows with annualReturn
  let savedValue = inputs.currentSavings; // Amount that grows with savingsInterestRate
  const projectedYearsFromResults =
    results && Number.isFinite(results.yearsToFI) ? Math.ceil(results.yearsToFI) : inputs.timeHorizon;
  const yearsToProject =
    mode === 'contribution-based' && results
      ? Math.max(projectedYearsFromResults, inputs.timeHorizon)
      : inputs.timeHorizon;

  if (mode === 'contribution-based') {
    monthlySavingsContribution = inputs.monthlySavings || 0;
    monthlyInvestmentContribution = inputs.monthlyInvestment || 0;
    targetAmount = results?.baseFINumber || inputs.targetFINumber;
  }

  if (mode === 'time-based' && results?.baseFINumber) {
    targetAmount = results.baseFINumber;
  }

  for (let year = 0; year <= yearsToProject; year++) {
    data.push({
      year,
      savings: Math.round(investedValue + savedValue),
      target: calculateInflationAdjustedAmount(targetAmount, inputs.inflationRate, year),
    });

    // Calculate next year's value
    for (let month = 0; month < 12; month++) {
      savedValue = savedValue * (1 + monthlySavingsRate) + monthlySavingsContribution;
      investedValue = investedValue * (1 + monthlyInvestmentRate) + monthlyInvestmentContribution;
    }
  }

  return data;
}
