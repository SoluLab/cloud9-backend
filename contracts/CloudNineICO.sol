//SPDX-License-Identifier: Unlicense
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract CloudNineICO is Crowdsale, Ownable {
    using SafeMath for uint256;

    uint256 public publicSale1Quantity = 100000000 * 10**18;
    uint256 public publicSale2Quantity = 250000000 * 10**18;
    uint256 public publicSale3Quantity = 300000000 * 10**18;
    uint256 public publicSale4Quantity = 450000000 * 10**18;
    uint256 public publicSale5Quantity = 500000000 * 10**18;
    uint256 public publicSale6Quantity = 2000000000 * 10**18;

    enum ICOStage {
        PublicSale1,
        PublicSale2,
        PublicSale3,
        PublicSale4,
        PublicSale5,
        PublicSale6
    }

    ICOStage public stage = ICOStage.PublicSale1;

    constructor(
        uint256 rate_,
        address payable wallet_,
        IERC20 token_
    ) public Crowdsale(rate_, wallet_, token_) {}

    event StageChange(uint256 newStage);
    event BuyToken(address beneficiary, uint256 tokenAmount);

    function rate() public view returns (uint256) {
        return calculateRate();
    }

    function changeStage() external onlyOwner {
        _changeStage();
    }

    // Calculate Rate according to Stage
    function calculateRate() internal view returns (uint256) {
        if (stage == ICOStage.PublicSale1) {
            return 267;
        } else if (stage == ICOStage.PublicSale2) {
            return 250;
        } else if (stage == ICOStage.PublicSale3) {
            return 235;
        } else if (stage == ICOStage.PublicSale4) {
            return 222;
        } else if (stage == ICOStage.PublicSale5) {
            return 211;
        } else return 200;
    }

    function _changeStage() internal {
        require(stage != ICOStage.PublicSale6, "End of stages");
        ICOStage stage_ = ICOStage(uint256(stage).add(1));
        stage = stage_;
        emit StageChange(uint256(stage));
    }

    function _getTokenAmount(uint256 weiAmount)
        internal
        view
        returns (uint256)
    {
        return (weiAmount.mul(calculateRate()));
    }

    function _processPurchase(address beneficiary, uint256 tokenAmount)
        internal
    {
        if (stage == ICOStage.PublicSale1) {
            if (tokenAmount > publicSale1Quantity) {
                revert("Token Amount is more than remaining token");
            }
            publicSale1Quantity = publicSale1Quantity.sub(tokenAmount);

            if (publicSale1Quantity == 0) {
                _changeStage();
            }
        } else if (stage == ICOStage.PublicSale2) {
            if (tokenAmount > publicSale2Quantity) {
                revert("Token Amount is more than remaining token");
            }
            publicSale2Quantity = publicSale2Quantity.sub(tokenAmount);

            if (publicSale2Quantity == 0) {
                _changeStage();
            }
        } else if (stage == ICOStage.PublicSale3) {
            if (tokenAmount > publicSale3Quantity) {
                revert("Token Amount is more than remaining token");
            }
            publicSale3Quantity = publicSale3Quantity.sub(tokenAmount);

            if (publicSale3Quantity == 0) {
                _changeStage();
            }
        } else if (stage == ICOStage.PublicSale4) {
            if (tokenAmount > publicSale4Quantity) {
                revert("Token Amount is more than remaining token");
            }
            publicSale4Quantity = publicSale4Quantity.sub(tokenAmount);

            if (publicSale4Quantity == 0) {
                _changeStage();
            }
        } else if (stage == ICOStage.PublicSale5) {
            if (tokenAmount > publicSale5Quantity) {
                revert("Token Amount is more than remaining token");
            }
            publicSale5Quantity = publicSale5Quantity.sub(tokenAmount);

            if (publicSale5Quantity == 0) {
                _changeStage();
            }
        } else if (stage == ICOStage.PublicSale6) {
            if (tokenAmount > publicSale6Quantity) {
                revert("Token Amount is more than remaining token");
            }
            publicSale6Quantity = publicSale6Quantity.sub(tokenAmount);
        }
        emit BuyToken(beneficiary, tokenAmount);
        super._processPurchase(beneficiary, tokenAmount);
    }

    function sendTokens(address recipient, uint256 weiAmount)
        external
        onlyOwner
    {
        _processPurchase(recipient, weiAmount);
    }
}