import { tool, type ToolSet } from 'ai';
import { z } from 'zod';

const recoveryContext = z.object({
  factoryId: z.string().describe('Factory identifier'),
  toolId: z.string().describe('Process tool identifier'),
  product: z.string().describe('Product name'),
  layer: z.string().describe('Process layer'),
});

export const recoveryTools: ToolSet = {
  resolve_process_context: tool({
    description: 'Resolve the tool, chamber, recipe, and applicable SOP from the recovery input.',
    inputSchema: recoveryContext,
    execute: async (input) => ({
      source: 'mock-process-context',
      ...input,
      chamber: 'CH-A',
      recipe: 'RECOVERY-ETCH-01',
      recipeVersion: '1.4',
      sopId: 'SOP-REC-017',
      sopVersion: '3.2',
    }),
  }),
  get_sop_rules: tool({
    description: 'Get structured SOP gates, adjustment boundaries, and review requirements.',
    inputSchema: z.object({ sopId: z.string(), sopVersion: z.string() }),
    execute: async (input) => ({
      source: 'mock-sop-rules',
      ...input,
      gates: ['R2R state must be valid', 'Latest metrology must be in specification'],
      adjustmentRange: { min: -2, max: 2, unit: '%' },
      engineerReviewRequired: true,
    }),
  }),
  get_r2r_state: tool({
    description: 'Read the current R2R control state. This tool is read-only.',
    inputSchema: z.object({ toolId: z.string(), chamber: z.string(), recipe: z.string() }),
    execute: async (input) => ({
      source: 'mock-r2r',
      ...input,
      currentValue: 100,
      unit: '%',
      controllerStatus: 'valid',
      sampledAt: new Date().toISOString(),
    }),
  }),
  get_metrology_and_spc: tool({
    description: 'Read the latest metrology and SPC summary. This tool is read-only.',
    inputSchema: z.object({ toolId: z.string(), product: z.string(), layer: z.string() }),
    execute: async (input) => ({
      source: 'mock-metrology-spc',
      ...input,
      measurement: 99.2,
      target: 100,
      specification: { lower: 97, upper: 103 },
      trend: 'stable',
      sampledAt: new Date().toISOString(),
    }),
  }),
  get_historical_recovery_values: tool({
    description: 'Find comparable historical recovery cases. This tool is read-only.',
    inputSchema: recoveryContext,
    execute: async (input) => ({
      source: 'mock-recovery-history',
      matchCriteria: ['tool', 'product', 'layer'],
      cases: [
        { recoveryValue: 100.6, outcome: 'pass' },
        { recoveryValue: 100.8, outcome: 'pass' },
      ],
      ...input,
    }),
  }),
  calculate_recommended_value: tool({
    description: 'Deterministically calculate and validate a recovery release value from collected evidence.',
    inputSchema: z.object({
      currentValue: z.number(),
      measurement: z.number(),
      target: z.number(),
      minAdjustment: z.number(),
      maxAdjustment: z.number(),
    }),
    execute: async (input) => {
      const requestedAdjustment = input.target - input.measurement;
      const adjustment = Math.min(Math.max(requestedAdjustment, input.minAdjustment), input.maxAdjustment);

      return {
        source: 'deterministic-calculation',
        recommendedValue: Number((input.currentValue + adjustment).toFixed(3)),
        adjustment: Number(adjustment.toFixed(3)),
        unit: '%',
        wasClamped: adjustment !== requestedAdjustment,
      };
    },
  }),
};
