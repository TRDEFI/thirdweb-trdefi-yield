// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

import { FeeProtocol } from "./instructions/FeeProtocol.sol";
import { PeggedSwap } from "./instructions/PeggedSwap.sol";
import { Salt } from "./instructions/Controls.sol";

/// @title TRDEFI Retail strategy program builder
/// @notice Model A: single user commission via FeeProtocol, no protocol cut (phase-1: 0%).
/// @notice Fee scale is SwapVM 1e7 (10_000_000 = 100%). Retail cap: 2_000_000 = 20%.
/// @dev Mirrors TRDEFI_TR01.buildProgram, minus FeeFlatIn, plus parameterized maker fee.
///      NOTE: resolves inside the swap-vm workspace at faz-2 compile time.
library TRDEFI_Retail {
    uint24 internal constant MAX_MAKER_FEE_BPS = 2_000_000; // 20%, SwapVM 1e7 fee scale
    uint256 internal constant LINEAR_WIDTH = 200e27;

    function buildProgram(
        address tokenA,
        address tokenB,
        uint256 balanceA,
        uint256 balanceB,
        uint24 makerFeeBps,
        address feeReceiver,
        bytes32 salt
    ) internal pure returns (bytes memory) {
        require(tokenA < tokenB, "RETAIL: tokens not sorted");
        require(feeReceiver != address(0), "RETAIL: fee receiver is zero");
        require(balanceA > 0 && balanceB > 0, "RETAIL: balances must be > 0");
        require(makerFeeBps <= MAX_MAKER_FEE_BPS, "RETAIL: fee exceeds 20%");

        // NOTE: FeeProtocol with feeBps=0 && surplusBps=0 reverts on-chain
        // (FeeProtocolNoFeeFlagsSet), so the opcode is omitted when fee is zero.
        // The off-chain port (ai-agent/build-order.js) mirrors this rule exactly.
        bytes memory feePart = makerFeeBps > 0
            ? FeeProtocol.build(true, _singleReceiver(feeReceiver, makerFeeBps), new FeeProtocol.ProviderConfig[](0), 0)
            : bytes("");

        return bytes.concat(
            feePart,
            PeggedSwap.build(balanceA, balanceB, LINEAR_WIDTH, 1, 1),
            Salt.build(uint64(bytes8(salt)))
        );
    }

    function _singleReceiver(address feeReceiver, uint24 makerFeeBps)
        internal
        pure
        returns (FeeProtocol.ReceiverConfig[] memory receivers)
    {
        receivers = new FeeProtocol.ReceiverConfig[](1);
        receivers[0] = FeeProtocol.ReceiverConfig({ receiver: feeReceiver, feeBps: makerFeeBps, surplusBps: 0 });
    }
}
