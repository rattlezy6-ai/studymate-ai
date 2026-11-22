# StudyMate AI

StudyMate AI adalah aplikasi asisten belajar berbasis web yang menggunakan Gemini API untuk membantu pengguna memahami materi, membuat rangkuman, dan berlatih soal.

## Fitur
- Tanya jawab materi dengan AI.
- Mode penjelasan, rangkuman, dan latihan soal.
- Riwayat percakapan selama halaman dibuka.
- Tampilan responsif untuk laptop dan ponsel.
- API Key disimpan di server melalui environment variable.

## Teknologi
- Frontend: HTML, CSS, JavaScript.
- Backend: Vercel Serverless Function (Node.js).
- AI: Google Gemini API.
- Hosting: Vercel.

## Menjalankan secara lokal
1. Pastikan Node.js sudah terpasang.
2. Pasang Vercel CLI: `npm install -g vercel`
3. Masuk ke folder proyek, lalu jalankan `npm install`.
4. Buat file `.env.local` dan isi:
   `GEMINI_API_KEY=API_KEY_MILIK_ANDA`
5. Jalankan `vercel dev`.
6. Buka alamat lokal yang ditampilkan Vercel.

Jangan mengunggah file `.env.local` atau membagikan API Key ke publik.

## Deploy ke Vercel
1. Unggah folder proyek ini ke repository GitHub.
2. Impor repository tersebut melalui dashboard Vercel.
3. Pada Project Settings > Environment Variables, tambahkan:
   - Name: `GEMINI_API_KEY`
   - Value: API Key Gemini milik pemilik proyek
   - Environment: Production (tambahkan Preview jika diperlukan)
4. Simpan, lalu lakukan deploy/redeploy.
5. Buka URL hasil deployment dan uji fitur tanya jawab.

## Catatan
- Aplikasi membutuhkan koneksi internet dan API Key Gemini yang valid.
- Penggunaan API dapat tunduk pada kuota dan ketentuan layanan Google.
- Jika model `gemini-3.8-flash` tidak tersedia pada akun/API Key, ubah nama model di `api/chat.js` ke model Flash yang tersedia di Google AI Studio.
- Sebelum dibagikan, uji endpoint dengan pertanyaan sederhana.

## Identitas tugas
Nama aplikasi: StudyMate AI  
Mata kuliah: Dasar Komputer dan Pemrograman (DKP)  
Jenis aplikasi: Web AI Study Assistant
