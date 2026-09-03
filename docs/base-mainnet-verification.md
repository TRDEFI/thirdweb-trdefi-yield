# Base mainnet adres doğrulaması — 2026-09-03

Yöntem: `eth_getCode` (https://mainnet.base.org, chain 8453).

| Kontrat | Adres | Kod | Sonuç |
|---|---|---|---|
| Aqua core | `0x1111113ccf1426a8e30e2bff5e005d929bf6a90a` | ~5.619 byte | ✅ MEVCUT |
| SwapVM router | `0x111111338c5091e8440b67b168bae16a668ac0de` | ~20.541 byte | ✅ MEVCUT |

Base mainnet (8453) execution için AÇIK: ship/swap hedef kontratlar zincirde duruyor.
Tarama kodundaki adresler Base'de geçerli. Diğer zincirler (Ethereum/Arbitrum/Optimism/Polygon)
aynı yöntemle doğrulanacak — sıradaki adım.

Not: getCode varlığı interface uyumunu kanıtlamaz; ilk gerçek ship Sepolia'da
kullanıcı imzalı akışla test edilecek.
