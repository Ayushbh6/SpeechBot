export async function POST() {
  const res = await fetch(
    'https://api.openai.com/v1/realtime/sessions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-realtime',
        voice: 'verse',
      }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    return new Response(text, { status: 500 });
  }
  return new Response(text, { status: 200 });
}