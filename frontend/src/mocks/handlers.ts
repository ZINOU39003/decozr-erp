import { http, HttpResponse, delay } from 'msw';
import { orderHandlers } from '../modules/orders/api/handlers';

// Utility for realistic latency and random failure
export const withArtificialLatency = async (failProbability: number = 0.05) => {
  // Random delay between 300ms and 1200ms
  const ms = Math.floor(Math.random() * (1200 - 300 + 1)) + 300;
  await delay(ms);

  // Random failure
  if (Math.random() < failProbability) {
    throw new HttpResponse(null, { status: 500, statusText: 'Internal Server Error (Simulated)' });
  }
};

export const handlers = [
  // ...orderHandlers,
  // Example dummy handler
  http.get('/api/v1/health', async () => {
    await withArtificialLatency();
    return HttpResponse.json({ status: 'ok' });
  }),
];
