// SPDX-License-Identifier: LicenseRef-Degensoft-SwapVM-1.1
pragma solidity 0.8.30;

import { ISwapVM } from "./interfaces/ISwapVM.sol";
import { MakerTraitsLib } from "./libs/MakerTraits.sol";
import { TRDEFI_Retail } from "./TRDEFI_Retail.sol";

/// @title TRDEFI RetailBuilder — publish candidate name (approved 2026-09-03)
/// @notice Retail variant of TRDEFI_TR01Builder: user-set commission 0..20%,
///         fee goes to the user's own receiver, no protocol cut (phase-1).
/// @dev Pure/view only — no deployment needed for the app (off-chain port in
///      ai-agent/build-order.js is byte-equivalent). Deploy only for the
///      canonical on-chain reference + thirdweb Publish (faz-2, optional).
///      NOTE: resolves inside the swap-vm workspace at faz-2 compile time.
contract TRDEFI_RetailBuilder {
    using MakerTraitsLib for *;

    function buildOrder(
        address maker,
        address tokenA,
        address tokenB,
        uint256 balanceA,
        uint256 balanceB,
        uint24 makerFeeBps,
        address feeReceiver,
        bytes32 salt
    ) external pure returns (ISwapVM.Order memory order) {
        require(tokenA < tokenB, "RETAIL: tokens not sorted");
        bytes memory program = TRDEFI_Retail.buildProgram(
            tokenA, tokenB, balanceA, balanceB, makerFeeBps, feeReceiver, salt
        );
        order = MakerTraitsLib.build(MakerTraitsLib.Args({
            maker: maker,
            receiver: address(0),
            tokenA: tokenA,
            tokenB: tokenB,
            shouldUnwrapWeth: false,
            useAquaInsteadOfSignature: true,
            allowZeroAmountIn: false,
            hasPreTransferInHook: false,
            hasPostTransferInHook: false,
            hasPreTransferOutHook: false,
            hasPostTransferOutHook: false,
            preTransferInTarget: address(0),
            preTransferInData: "",
            postTransferInTarget: address(0),
            postTransferInData: "",
            preTransferOutTarget: address(0),
            preTransferOutData: "",
            postTransferOutTarget: address(0),
            postTransferOutData: "",
            program: program
        }));
    }
}
