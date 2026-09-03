# keys/ — secret drop zone (git-ignored)

- `openrouter.key.txt` → OpenRouter API key (tek satır). Sahibi doldurur.
- Bu klasöre konan `*.key.txt` / `*.key` dosyaları commite girmez.
- Üretimde key Netlify environment variable olarak da tanımlanır: `OPENROUTER_API_KEY`.
- Frontend bu klasöre ASLA erişmez; sadece server-side function'lar okur.
