// Seed categories: one entry = a content format + the prompt that steers the
// AI to produce that format. Each prompt embeds the hook/content example so the
// generator stays consistent per category. Edit freely — it is applied on boot
// (idempotent) and does not overwrite a prompt you've already customized.

export const CATEGORY_SEEDS = [
  {
    name: "story",
    default_prompt: `Write ONE micro-fiction for this account. Provide a hook that pulls the reader in and a short 2-4 line story with a small twist or emotional payoff. Write in the same language as the rest of this account's content.

Example:
Hook: Aku berhenti setelah satu hal menyadarkanku.
Content: Semakin aku mengejar uang, semakin aku fokus pada apa yang bisa aku dapat.
Setelah fokusku berubah menjadi **"masalah apa yang bisa aku selesaikan?"**, uang justru menjadi hasil dari proses itu.`,
  },
  {
    name: "tips",
    default_prompt: `Write ONE practical tip or habit for this account. Provide a hook and a short 2-4 line content that gives one concrete, small action the viewer can take today.

Example:
Hook: Kalau kamu susah konsisten, jangan mulai dari target besar.
Content: Mulai dari yang terlalu mudah untuk ditolak:
- Baca **1 halaman**
- Olahraga **5 menit**
- Belajar **10 menit**

Konsistensi lebih mudah dibangun dari kebiasaan kecil daripada motivasi besar.`,
  },
  {
    name: "steps",
    default_prompt: `Write a short step-by-step process for this account (a small numbered list of 3-5 actionable steps). Provide a hook and content where each step is one short line.

Example:
Hook: Bingung mau mulai bisnis? Lakukan 3 hal ini.
Content: **3 langkah sederhana:**
1. Cari masalah nyata.
2. Pastikan orang mau membayar solusinya.
3. Tawarkan solusi paling sederhana yang bisa kamu jual hari ini.`,
  },
  {
    name: "myth",
    default_prompt: `Write a myth-vs-fact piece for this account. Provide a hook, then content with one line labeled MYTH (a common misconception) and one line labeled FACT (the truth that busts it). Keep it factual.

Example:
Hook: Mitologi sukses yang terlalu banyak dipercaya.
Content: **MYTH:** Kerja keras selalu membuatmu kaya.
**FACT:** Kerja keras hanya memperbesar hasil kalau yang kamu kerjakan memang bernilai.`,
  },
  {
    name: "compare",
    default_prompt: `Write a concise comparison piece for this account. Provide a hook and short content contrasting two things, ending with a clear takeaway.

Example:
Hook: Sibuk vs produktif: kelihatannya sama, hasilnya berbeda.
Content: **Sibuk** = banyak hal dikerjakan.
**Produktif** = hal yang penting diselesaikan.

Jangan ukur harimu dari banyaknya tugas, tapi dari besar hasil yang kamu ciptakan.`,
  },
  {
    name: "q&a",
    default_prompt: `Write a short Q&A / question-answer piece for this account. Provide a hook as a provocative question and content that answers it concisely.

Example:
Hook: Mengapa tahu banyak tidak otomatis membawa hasil?
Content: Karena pintar memahami masalah **≠** berani bertindak.
Pengetahuan memberi kemungkinan, tetapi **eksekusi** yang mengubahnya menjadi hasil.`,
  },
  {
    name: "quote",
    default_prompt: `Write a powerful quote-style piece for this account. The hook introduces the idea (not a question). The content is the quote itself written in quotation marks, followed on the next line by who said it (attribution).

Example:
Hook: Pesan bijak yang sering luput.
Content: "Jangan mengejar uang. Kejar nilai. Uang adalah imbalan, dan nilai adalah alasan orang bersedia membayarmu."
*— Seneca*`,
  },
  {
    name: "stat",
    default_prompt: `Write a statistic-driven insight for this account. Provide a hook with a striking number or contrast and content that explains what the number really means in 2-3 short lines.

Example:
Hook: Besarnya audiens tidak menjamin penjualan.
Content: Jumlah followers mengukur **ukuran audiens**, bukan **kualitas permintaan**.
**100** orang yang benar-benar butuh produkmu bisa lebih berharga daripada **100.000** yang hanya melihat kontenmu.`,
  },
  {
    name: "tierlist",
    default_prompt: `Write a short tierlist for this account. Provide a hook and content as letter tiers (S/A/B/C/D) each on its own line, most important first.

Example:
Hook: Kalau mau membangun bisnis, ini urutan yang harus kamu prioritaskan.
Content: **S:** Masalah nyata
**A:** Orang yang mau membayar
**B:** Solusi
**C:** Branding
**D:** Logo`,
  },
  {
    name: "warning",
    default_prompt: `Write a cautionary piece for this account. Provide a hook that warns and content describing red flags to watch for, in 2-3 short lines.

Example:
Hook: Tanda kamu sedang sibuk, bukan sedang membangun.
Content: Kamu sibuk membuat fitur, memperbaiki logo, mengganti warna website, tapi **belum pernah menawarkan produk ke calon pelanggan**.
Bisa jadi kamu membangun bisnis tanpa memastikan ada yang mau membeli.`,
  },
  {
    name: "formula",
    default_prompt: `Write a short formula for this account. Provide a hook and content as a single formula line (variables combined with symbols/arrows).

Example:
Hook: Menjadi kaya itu mudah.
Content: **Masalah yang kamu selesaikan × jumlah orang yang kamu bantu × seberapa sulit kamu digantikan = nilai ekonomi**`,
  },
  {
    name: "checklist",
    default_prompt: `Write a short checklist for this account. Provide a hook and content as a short checklist of questions or items, each on its own line prefixed with a box mark.

Example:
Hook: Jawab ini dulu sebelum kamu bangun apa pun.
Content: Sebelum membuat produk:
- [ ] Masalahnya nyata?
- [ ] Siapa yang mengalaminya?
- [ ] Mereka mau membayar?
- [ ] Solusiku lebih baik dari alternatif yang ada?`,
  },
];
