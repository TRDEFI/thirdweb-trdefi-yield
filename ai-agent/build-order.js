// TRDEFI retail off-chain order builder (Faz-1, $0 deploy).
// Byte-exact JS port of the on-chain builders in tr01-sepolia/swap-vm/src:
//   TRDEFI_TR01.buildProgram + TRDEFI_TR01Builder.buildOrder
// No dependencies. All integers as BigInt. Addresses as 0x-hex strings.
//
// Fee scale: SwapVM 1e7 (10_000_000 = 100%). Retail cap: 2_000_000 = 20%.
// Retail program (Model A, protocol cut 0%):
//   FeeProtocol(user fee -> user receiver) + PeggedSwap + Salt   (no FeeFlatIn)

export const SCALE = 10_000_000n;
export const MAX_RETAIL_FEE_BPS = 2_000_000; // 20%
export const LINEAR_WIDTH = 200n * 10n ** 27n;

const OP = { Salt: 0x02, PeggedSwap: 0x58, FeeFlatIn: 0x70, FeeProtocol: 0x80 };

function hexToBytes(h) {
  h = h.toLowerCase().replace(/^0x/, '');
  if (h.length % 2) h = '0' + h;
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function bigToBytesBE(v, len) {
  v = BigInt(v);
  if (v < 0n) throw new Error('negative value');
  const out = new Uint8Array(len);
  for (let i = len - 1; i >= 0; i--) { out[i] = Number(v & 0xffn); v >>= 8n; }
  if (v !== 0n) throw new Error('value overflow');
  return out;
}
function concat(...arrs) {
  const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0));
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}
export function toHex(bytes) {
  return '0x' + [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
function instr(opcode, args) {
  if (args.length > 255) throw new Error('args too long');
  return concat(new Uint8Array([opcode, args.length]), args);
}
const norm = a => a.toLowerCase();

export function validateCommon({ tokenA, tokenB, feeReceiver, x0, y0 }) {
  tokenA = norm(tokenA); tokenB = norm(tokenB); feeReceiver = norm(feeReceiver);
  if (!(tokenA < tokenB)) throw new Error('tokens not sorted (tokenA must be < tokenB)');
  if (/^0x0+$/.test(feeReceiver)) throw new Error('fee receiver is zero');
  if (BigInt(x0) <= 0n || BigInt(y0) <= 0n) throw new Error('x0/y0 must be > 0');
  return { tokenA, tokenB, feeReceiver };
}

function feeProtocolProgram({ feeReceiver, feeBps }) {
  feeBps = Number(feeBps);
  const takeFlat = feeBps > 0;
  const flags = new Uint8Array([0x80 | 1]); // isTokenIn=true, count=1
  const rflags = new Uint8Array([(takeFlat ? 0x40 : 0x00)]);
  const parts = [flags, rflags, hexToBytes(feeReceiver)];
  if (takeFlat) parts.push(bigToBytesBE(feeBps, 3));
  return instr(OP.FeeProtocol, concat(...parts));
}
function feeFlatInProgram(feeBps) {
  return instr(OP.FeeFlatIn, bigToBytesBE(feeBps, 3));
}
function peggedSwapProgram({ x0, y0 }) {
  return instr(OP.PeggedSwap, concat(
    bigToBytesBE(x0, 32), bigToBytesBE(y0, 32),
    bigToBytesBE(LINEAR_WIDTH, 32), bigToBytesBE(1, 32), bigToBytesBE(1, 32),
  ));
}
function saltProgram(salt64) {
  return instr(OP.Salt, bigToBytesBE(salt64, 8));
}

// TR-01 exact replica (for differential test vs on-chain builder).
// TRDEFI_FEE_BPS=5000 via FeeProtocol, MAKER_FEE_BPS=30000 via FeeFlatIn.
export function buildTR01Program({ tokenA, tokenB, x0, y0, feeReceiver, salt64 }) {
  validateCommon({ tokenA, tokenB, feeReceiver, x0, y0 });
  return toHex(concat(
    feeProtocolProgram({ feeReceiver: norm(feeReceiver), feeBps: 5000 }),
    feeFlatInProgram(30000),
    peggedSwapProgram({ x0, y0 }),
    saltProgram(salt64),
  ));
}

// Retail program (Model A): single user commission via FeeProtocol, no FeeFlatIn,
// no protocol cut. makerFeeBps: 0..2_000_000 (0..20%).
export function buildRetailProgram({ tokenA, tokenB, x0, y0, makerFeeBps, feeReceiver, salt64 }) {
  validateCommon({ tokenA, tokenB, feeReceiver, x0, y0 });
  makerFeeBps = Number(makerFeeBps);
  if (!(makerFeeBps >= 0 && makerFeeBps <= MAX_RETAIL_FEE_BPS)) throw new Error('fee out of range 0..20%');
  return toHex(concat(
    feeProtocolProgram({ feeReceiver: norm(feeReceiver), feeBps: makerFeeBps }),
    peggedSwapProgram({ x0, y0 }),
    saltProgram(salt64),
  ));
}

// Order traits for TRDEFI_TR01Builder.buildOrder args used (no hooks, receiver=0, aqua mode).
export function buildTraits() {
  const indexes = 0x0028002800280028n; // all slice indexes = 40
  return (1n << 254n) | (indexes << 160n);
}
export function buildOrderData({ tokenA, tokenB, programHex }) {
  return toHex(concat(hexToBytes(tokenA), hexToBytes(tokenB), hexToBytes(programHex)));
}
