# Process Plan — TRDeFi x thirdweb retail app

## Hedef
thirdweb kullanıcıları thirdweb cüzdanlarıyla login olur, AI rehberliğinde pair + tutar +
komisyon seçer, script (ship parametreleri) üretilir, kullanıcı onayıyla strateji zincire
kaydedilir. Fonlar cüzdandan çıkmaz; istenince revoke ile çıkılır.

## Mimari (4 ekran, tek sayfa)
1. **Login** — thirdweb Connect (e-posta/sosyal) + Safe/MetaMask bağla.
2. **Pair seçimi** — `GET /api/strategies` taramasından auto-fetch selector (verified/known
   bayraklı). Desteklenmeyen ağda kart kilitli.
3. **AI yönlendirme + onay** — 3 soru (pair, tutar, fee receiver + komisyon %) → taslak
   kartı → "Onayla & İmzala" → cüzdanda `approve` + `ship` (session key ile gasless).
4. **Pozisyonum + Revoke** — aktif stratejiler, biriken fee, tek işlemle `dock` + `approve(0)`.

## Backend
- Mevcut (yeniden kullanılır): `strategies` (liste), `quote` (simülasyon), `balances`, `stats`.
- Yeni `api/agent-draft` — AI soru-cevap → ship parametre taslağı (JSON, zincire dokunmaz).
  Key server-side; IP başına rate-limit; fallback model zinciri.
- Yeni `api/session-policy` — session key izin şablonu (hedef + limit + süre).
- `ship.js` ikiye bölünür: `ship-demo` (mevcut server-key, testnet) + `ship-user`
  (kullanıcı imzalı, mainnet). Mevcut koda dokunmadan yeni dosya.

## Fee modeli (koddan doğrulandı)
- `feeBps`: taker'ın ödediği flat komisyon, maker'ın receiver adresine gider.
- `surplusBps`: beklenenden iyi fiyatta farktan maker öder.
- Protokol tavanı: toplam <%100. Ürün cap'i: %0–20, varsayılan %0.3.
- Pro-rata havuz paylaşımı YOK; her strateji kendi fill'inden kazanır.
- Maker kazancı = curve spread (X0/Y0 merkezi) + feeBps.
- Şart: fill anında satılan token cüzdanda + allowance açık olmalı (ship öncesi balance-check).

## AI soruları (vade yok)
1. Hangi pair? (verified liste) 2. Tutar? 3. Fee receiver + komisyon %?
Risk ayrı soru değil, pair tipine gömülü not (stabil: depeg+kontrat; volatil: +IL).

## Guardrails
- Komisyon validasyonu %0–20; insan onayı zorunlu; her ekranda "garanti getiri yok" notu.
- `quote` simülasyonu USDC/USDT dışı pair'lere genişletilecek ya da "simülasyonsuz devam" akışı.

## thirdweb kapıları (sırayla)
1. `npx thirdweb publish` + template (izinsiz, ücretsiz).
2. Trusted Partner Program (ayrı HubSpot formu) + Showcase hazırlığı (paralel).
3. Contact-us formu en son, "zaten entegreyiz" diliyle. 8. alan tek satır → kanca metni.

## Contact kanca metni (taslak)
"Non-custodial treasury infra: users earn on any verified pair with no pool deposit
(revocable allowances, verified on-chain fees). Live demo + thirdweb Connect/Engine
integration in progress. Seeking Ecosystem + DeFi/Gaming showcase partnership."
