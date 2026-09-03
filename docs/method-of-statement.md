# Method of Statement — TRDeFi x thirdweb retail entegrasyonu

Onay tarihi: 2026-09-03. Sahip: Cem Yaltir. Proje klasörü: `thirdweb/` (trdefi-aqua'dan bağımsız).

## MoS-1 — Custody çizgisi
- Rozet/deneme-üretim ayrımı YOK. Tek akış: bağlan → seç → onayla → çık.
- Login seçenekleri yan yana: thirdweb (e-posta/sosyal) + cüzdan bağla (Safe/MetaMask).
- Login ekranında tek satır şeffaflık notu: thirdweb ile girişte anahtar thirdweb altyapısında, Safe'te kullanıcıda.
- Dışa dönük metinde alt katman protokol adı geçmez ("virtual strategies").

## MoS-2 — AI yetkisi
- AI yalnızca taslak üretir; kullanıcı explicit onaylamadan zincire işlem gitmez.
- Session key'lerde asla full-permission yok: hedef kontrat + tutar + süre sınırlı.
- API key yalnızca server-side (`api/agent-draft`); frontend key görmez.

## MoS-3 — Zincir matrisi
- Strateji altyapısının kurulu olduğu ağlar dışında buton pasif + açıklayıcı metin.
- Desteklenen ağlar UI'da net listelenir.

## MoS-4 — Maliyet
- Testnet sponsorlu; mainnet ücreti kullanıcıda.
- thirdweb Scale plan ($499) yalnızca pilot anlaşmayla açılır.

## MoS-5 — İsim yasağı
- Publish edilen kontrat bizim wrapper'ımız; alt katman adı dışa dönük hiçbir metinde geçmez.

## MoS-6 — Denetim
- Explore featured + kurumsal güven için audit raporu yol haritasında.
- Publish akışındaki audit PDF alanı kullanılacak.

## Ek kararlar (2026-09-03 revizyonu)
- **Tutar bandı YOK.** Bireysel/retail herkes bağlanıp işlem yapabilir; featured sonrası retail koşulları ayrı ele alınır.
- **Pair kısıtı YOK.** USD*C/USDT zorunluluğu yok; taramada verified görünen her pair seçilebilir.
- **Komisyon:** kullanıcı seçer, aralık %0–20, varsayılan %0.3. Protokol tavanı <%100 (kontrat: `totalFeeBps < BPS`).
- **Vade YOK.** Ship = pair + tutar + fee receiver; getiri taker swap'lerine bağlı; istenince revoke.
- **Storage:** MVP'de Supabase yok (Netlify + zincir + localStorage). Supabase faz-2'de (cihazlar-arası geçmiş, analitik).
- **Sıra:** app → deploy → yönlendirmeyle featured başvuruları → contact-us en son ("zaten entegreyiz" diliyle).
