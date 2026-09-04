# Adres matrisi — aqua core + router (getCode ile doğrulandı)

Tarih: 2026-09-03. Yöntem: public RPC `eth_getCode`.

| Zincir | Chain ID | Aqua core `0x1111…90a` | Router `0x1111…0de` |
|---|---|---|---|
| Base | 8453 | ✅ 5.619 byte | ✅ 20.541 byte |
| Ethereum | 1 | ✅ 5.619 byte | ✅ 20.541 byte |
| Arbitrum | 42161 | ✅ 5.619 byte | ✅ 20.541 byte |
| Optimism | 10 | ✅ 5.619 byte | ✅ 20.541 byte |
| Polygon | 137 | ✅ 5.619 byte | ✅ 20.541 byte |

Byte boyları 5 zincirde birebir aynı → aynı kontratlar her yerde kurulu.
UI zincir seçici yalnızca bu listeden beslenir.

Not: getCode varlığı interface uyumunu kanıtlamaz; ilk gerçek ship testte doğrulanır.
