import { saveOtp } from '../lib/database';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email required' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await saveOtp(email, code);

    console.log('OTP for testing:', code); 

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
