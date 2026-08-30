import { getDonorPortfolio, type DonorPortfolioInput } from '@/db/donor-portfolio';

export async function POST(request: Request) {
  try {
    const input = await request.json() as DonorPortfolioInput;
    return Response.json(await getDonorPortfolio(input), {
      headers: { 'Cache-Control': 'private, max-age=0' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid portfolio request.';
    const invalid = /Budget|weight|Unsupported/.test(message);
    if (!invalid) console.error('Donor portfolio failed', error);
    return Response.json({ error: invalid ? message : 'The portfolio builder is temporarily unavailable.' }, { status: invalid ? 400 : 503 });
  }
}
