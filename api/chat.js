
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY belum diatur."
      });
    }

    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Pesan tidak boleh kosong."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://studymate-ai.vercel.app",
          "X-Title": "StudyMate AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages,
          temperature: 0.7,
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenRouter API gagal."
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "Tidak ada jawaban."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
