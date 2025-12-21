import { validateOtp } from '../lib/database';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    const valid = await validateOtp(email, code);

    return Response.json({ valid });
  } catch (err) {
    return Response.json({ valid: false }, { status: 500 });
  }
}
