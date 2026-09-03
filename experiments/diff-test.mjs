// Differential test: JS port (ai-agent/build-order.js) vs on-chain TRDEFI_TR01Builder.
// Compares buildOrder(maker,traits,data) from Base Sepolia builder contract
// against the off-chain replica. Byte-exact match required.
// viem is loaded from trdefi-aqua/netlify/node_modules (no new deps).
import { createRequire } from 'node:module';
const require = createRequire('D:\\trdefi sitesi crypto on ramp\\trdefi-aqua\\netlify\\package.json');
const { createPublicClient, http, encodeFunctionData, decodeFunctionResult, encodeAbiParameters, keccak256 } = require('viem');

import { buildTR01Program, buildTraits, buildOrderData } from '../ai-agent/build-order.js';

const BUILDER = '0xbff01cbc4abf938f2117b47458c7a3ba8ef3481c';
const RPC = 'https://base-sepolia-rpc.publicnode.com';
const ABI = [{
  type: 'function', name: 'buildOrder', stateMutability: 'view',
  inputs: [
    { name: 'maker', type: 'address' }, { name: 'tokenA', type: 'address' },
    { name: 'tokenB', type: 'address' }, { name: 'balanceA', type: 'uint256' },
    { name: 'balanceB', type: 'uint256' }, { name: 'feeReceiver', type: 'address' },
    { name: 'salt', type: 'bytes32' },
  ],
  outputs: [
    { name: 'maker', type: 'address' }, { name: 'traits', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
}];

// Same inputs both sides (mirrors ship.js salt scheme, fixed counter for determinism)
const maker = '0xd718cf6e3c7e5e7490c00742872e4be7139c2205';
const tokenA = '0x036cbd53842c5426634e7929541ec2318f3dcf7e'; // USDC Base Sepolia
const tokenB = '0xa1b5da715e26418458e7639de17a99984094d210'; // dUSDT
const balA = 10_000_000n, balB = 10_000_000n;
const feeReceiver = '0x4c96da02d7120bfb81594d0e924b237e0c74660d';
const salt = '0x' + (12345n).toString(16).padStart(16, '0') + '0'.repeat(48);
const salt64 = BigInt('0x' + salt.slice(2, 18));

const client = createPublicClient({ transport: http(RPC) });
const data = encodeFunctionData({ abi: ABI, functionName: 'buildOrder', args: [maker, tokenA, tokenB, balA, balB, feeReceiver, salt] });
const raw = await client.call({ to: BUILDER, data });
// Manual ABI decode of struct return: [offset][maker][traits][dataOffset][len][bytes]
const h = raw.data.slice(2);
const base = 64; // skip tuple offset word
const onMaker = '0x' + h.slice(base + 24, base + 64);
const onTraits = BigInt('0x' + h.slice(base + 64, base + 128));
const dataAbs = base + parseInt(h.slice(base + 128, base + 192), 16) * 2;
const dataLen = parseInt(h.slice(dataAbs, dataAbs + 64), 16) * 2;
const onData = '0x' + h.slice(dataAbs + 64, dataAbs + 64 + dataLen);

const jsProgram = buildTR01Program({ tokenA, tokenB, x0: balA, y0: balB, feeReceiver, salt64 });
const jsTraits = buildTraits();
const jsData = buildOrderData({ tokenA, tokenB, programHex: jsProgram });

const hashOf = (m, t, d) => keccak256(encodeAbiParameters(
  [{ type: 'tuple', components: [{ name: 'maker', type: 'address' }, { name: 'traits', type: 'uint256' }, { name: 'data', type: 'bytes' }] }],
  [{ maker: m, traits: t, data: d }],
));

const onHash = hashOf(onMaker, onTraits, onData);
const jsHash = hashOf(maker, jsTraits, jsData);

console.log('on-chain traits :', onTraits.toString());
console.log('js       traits :', jsTraits.toString());
console.log('traits match    :', onTraits === jsTraits);
console.log('on-chain data   :', onData.slice(0, 66) + '...' + onData.slice(-8), `(${(onData.length - 2) / 2} bytes)`);
console.log('js       data   :', jsData.slice(0, 66) + '...' + jsData.slice(-8), `(${(jsData.length - 2) / 2} bytes)`);
console.log('data match      :', onData.toLowerCase() === jsData.toLowerCase());
if (onData.toLowerCase() !== jsData.toLowerCase()) {
  const a = onData.toLowerCase(), b = jsData.toLowerCase();
  let i = 0;
  while (i < Math.min(a.length, b.length) && a[i] === b[i]) i++;
  console.log('first diff at char:', i, '| on-chain:', a.slice(Math.max(0, i - 8), i + 16), '| js:', b.slice(Math.max(0, i - 8), i + 16));
}
console.log('strategyHash    :', onHash);
console.log('hash match      :', onHash === jsHash);
if (onTraits === jsTraits && onData.toLowerCase() === jsData.toLowerCase()) console.log('RESULT: MATCH — off-chain builder is byte-exact');
else { console.log('RESULT: MISMATCH'); process.exit(1); }
