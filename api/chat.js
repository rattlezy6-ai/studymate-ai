
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, mode } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Pertanyaan tidak boleh kosong."
      });
    }

    const instructions = {
      explain: "Jelaskan materi dengan bahasa Indonesia sederhana dan berikan contoh.",
      summary: "Buat rangkuman materi secara terstruktur dan ringkas.",
      quiz: "Buat latihan soal beserta kunci jawaban dan pembahasannya."
    };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `Kamu adalah StudyMate AI, asisten belajar.
Jawab dalam bahasa Indonesia.
${instructions[mode] || instructions.explain}`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gagal menghubungi Groq API."
      });
    }

    return res.status(200).json({
      answer: data.choices[0].message.content
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Terjadi kesalahan server."
    });
  }
}
