// Verify dashboard scan logic against the real trial strategy (read-only).
const RPC = 'https://base-sepolia-rpc.publicnode.com';
const WRAPPER = '0x264fabbc81cf7fb99f124c16ad0dfe08fb639df3';
const MAKER = '0xd718cf6e3c7e5e7490c00742872e4be7139c2205';
const SHIP_T = '0xdc3622e06fb145651f567d421c9ef261d71d43e3778b761907bc0d70d42e52b0';
async function rpc(method, params) {
  const r = await fetch(RPC, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}
(async () => {
  const latest = BigInt(await rpc('eth_blockNumber', []));
  const hx = n => '0x' + n.toString(16);
  const logs = await rpc('eth_getLogs', [{ address: WRAPPER, topics: [SHIP_T], fromBlock: hx(latest - 50000n), toBlock: hx(latest) }]);
  console.log('shipped logs (topic0-only, 50k blocks):', logs.length);
  const addrOf = w => '0x' + w.slice(-40).toLowerCase();
  for (const l of logs) {
    const d = l.data.slice(2);
    const maker = addrOf('0x' + d.slice(24, 64));
    const app = addrOf('0x' + d.slice(88, 128));
    const hash = '0x' + d.slice(128, 192);
    if (maker === MAKER) console.log('MATCH maker=%s app=%s hash=%s tx=%s', maker, app, hash.slice(0, 18) + '…', l.transactionHash.slice(0, 18) + '…');
  }
})().catch(e => console.log('ERR', e.message));
