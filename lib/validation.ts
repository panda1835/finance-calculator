import { z } from 'zod';

/**
 * Validation schema for financial inputs
 */
export const financialInputSchema = z.object({
  currentIncome: z
    .number()
    .positive('Annual income must be positive')
    .min(1, 'Annual income is required'),
  
  monthlyExpenses: z
    .number()
    .positive('Monthly expenses must be positive')
    .min(1, 'Monthly expenses are required'),
  
  currentSavings: z
    .number()
    .nonnegative('Current savings cannot be negative')
    .default(0),
  
  targetFINumber: z
    .number()
    .positive('FI number must be positive')
    .min(1, 'FI number is required'),
  
  timeHorizon: z
    .number()
    .positive('Time horizon must be positive')
    .min(1, 'Time horizon must be at least 1 year')
    .max(100, 'Time horizon cannot exceed 100 years'),
  
  annualReturn: z
    .number()
    .min(0, 'Annual return cannot be negative')
    .max(1, 'Annual return cannot exceed 100%'),
  
  inflationRate: z
    .number()
    .min(0, 'Inflation rate cannot be negative')
    .max(1, 'Inflation rate cannot exceed 100%'),
  
  monthlySavingsRate: z
    .number()
    .min(0, 'Savings rate cannot be negative')
    .max(1, 'Savings rate cannot exceed 100%')
    .optional(),
});

export type FinancialInputData = z.infer<typeof financialInputSchema>;
