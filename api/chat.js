
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Metode tidak diizinkan."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "API Key Gemini belum dipasang."
    });
  }

  const { question, mode, instruction, history = [] } = req.body || {};

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      error: "Pertanyaan tidak boleh kosong."
    });
  }

  const contents = history
    .slice(-8)
    .filter(item =>
      ["user", "model"].includes(item.role) &&
      typeof item.text === "string"
    )
    .map(item => ({
      role: item.role,
      parts: [{ text: item.text }]
    }));

  contents.push({
    role: "user",
    parts: [{
      text: `Kamu adalah StudyMate AI, asisten belajar yang ramah.

Mode belajar: ${mode || "explain"}

Instruksi: ${instruction || "Jelaskan materi dengan sederhana."}

Jawab menggunakan bahasa Indonesia yang mudah dipahami, terstruktur, dan berikan contoh jika diperlukan.

Pertanyaan:
${question}`
    }]
  });

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1800
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(502).json({
        error: "AI gagal memproses pertanyaan. Periksa API Key dan kuota."
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

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
