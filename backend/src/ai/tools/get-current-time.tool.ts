import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const timeZone = 'Asia/Shanghai';
const formatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export const getCurrentTimeTool = createTool({
  id: 'get-current-time',
  description: 'Get the current date and time in Beijing (Asia/Shanghai). Use this for questions about the current time or date.',
  inputSchema: z.object({}),
  outputSchema: z.object({ timeZone: z.literal(timeZone), dateTime: z.string() }),
  execute: async () => ({ timeZone, dateTime: formatter.format(new Date()) }),
});
