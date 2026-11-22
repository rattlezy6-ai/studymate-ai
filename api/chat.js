
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const token = process.env.HF_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "HF_TOKEN belum diatur di Vercel."
      });
    }

    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Pesan tidak boleh kosong."
      });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:cheapest",
          messages,
          max_tokens: 700,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Hugging Face API gagal."
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
