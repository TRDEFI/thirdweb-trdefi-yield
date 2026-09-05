// Verify event-data token extraction against the real trial Shipped event.
async function main() {
  const r = await fetch('https://base-sepolia-rpc.publicnode.com', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: ['0x286aa22e538a52d5179f9d5e37a2048f1fe5e14dfd7888c46605b603a32ed981'] }) });
  const j = await r.json();
  const l = j.result.logs.find(x => x.address.toLowerCase() === '0x264fabbc81cf7fb99f124c16ad0dfe08fb639df3' && x.topics[0] === '0xdc3622e06fb145651f567d421c9ef261d71d43e3778b761907bc0d70d42e52b0');
  const dataHex = l.data.slice(2);
  const dataOffBytes = parseInt(dataHex.slice(448, 512), 16);
  const dataAt = 320 + dataOffBytes * 2;
  const dLen = parseInt(dataHex.slice(dataAt, dataAt + 64), 16);
  console.log('dataOffBytes:', dataOffBytes, '| dataLen:', dLen);
  const tA = '0x' + dataHex.slice(dataAt + 64, dataAt + 104);
  const tB = '0x' + dataHex.slice(dataAt + 104, dataAt + 144);
  console.log('tokenA:', tA);
  console.log('tokenB:', tB);
  console.log('expect USDC 0x036cbd53842c5426634e7929541ec2318f3dcf7e');
  console.log('expect dUSDT 0xa1b5da715e26418458e7639de17a99984094d210');
  console.log('MATCH:', tA.toLowerCase() === '0x036cbd53842c5426634e7929541ec2318f3dcf7e' && tB.toLowerCase() === '0xa1b5da715e26418458e7639de17a99984094d210');
}
main().catch(e => console.log('ERR', e.message));
