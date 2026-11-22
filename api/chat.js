
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Metode tidak diizinkan."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API Key OpenAI belum dipasang."
    });
  }

  const { question, mode, instruction, history = [] } = req.body || {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      error: "Pertanyaan tidak boleh kosong."
    });
  }

  const messages = [
    {
      role: "system",
      content: `Kamu adalah StudyMate AI, asisten belajar yang ramah.
Mode belajar: ${mode || "explain"}
Instruksi: ${instruction || "Jelaskan materi dengan sederhana."}
Jawab dalam bahasa Indonesia yang mudah dipahami, terstruktur, dan berikan contoh jika diperlukan.`
    }
  ];

  history.slice(-8).forEach(item => {
    if (
      ["user", "assistant"].includes(item.role) &&
      typeof item.text === "string"
    ) {
      messages.push({
        role: item.role,
        content: item.text
      });
    }
  });

  messages.push({
    role: "user",
    content: question
  });

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages,
          temperature: 0.7,
          max_tokens: 1800
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(response.status).json({
        error: data.error?.message || "AI gagal memproses pertanyaan."
      });
    }

    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(502).json({
        error: "AI belum memberikan jawaban."
      });
    }

    return res.status(200).json({ answer });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Terjadi gangguan pada server."
    });
  }
}
