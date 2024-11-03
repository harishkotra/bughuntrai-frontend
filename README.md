# BugHuntr.ai - AI-Powered Smart Contract Security Scanner 🛡️

BugHuntr.ai is an innovative platform that combines artificial intelligence with blockchain technology to analyze and verify smart contract security. Our platform helps developers identify potential vulnerabilities in their smart contracts and permanently record the audit results on the AIA Chain.

[Deployed Smart Contract on AIA Chain](https://testnet.aiascan.com/address/0x41B20e82DBFDe8557363Ca0B7C232C7288EA3Aae)

[Smart Contract Code Repo](https://github.com/harishkotra/bughuntrai)

## 🌟 Features

- **AI-Powered Analysis**: Leverages advanced language models to detect potential security vulnerabilities
- **Real-time Feedback**: Get instant analysis of your smart contract code
- **On-Chain Verification**: Permanently record audit results on AIA Chain
- **Import Verified Contracts**: Easily analyze contracts already deployed on AIA Chain

## 🔍 Recent Audits

Our platform is already being used to analyze and verify smart contracts. Here are some recent reports minted on AIA Chain:

- [Audit Report #1](https://testnet.aiascan.com/tx/0xef5fb0d53c2b664d1c7097454dce4dc63e902a96b1f06fd7e8b168d839c9f57d)
- [Audit Report #2](https://testnet.aiascan.com/tx/0x6787629ff9939bd557cf2cb00ae5dfa1ec27b7c604740a763ee7d844ff6aa68f)

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/bughuntrai-frontend.git

# Install dependencies
cd bughuntrai-frontend
npm install

# Start the development server
npm run dev
```

## 📝 Usage

1. Connect your AIA Chain wallet
2. Paste your smart contract code or import a verified contract
3. Click "Analyze Contract" to start the security scan
4. Review the findings
5. Submit the report on-chain (optional)

## 🎯 Roadmap

### Phase 1: Core Features Enhancement
- [ ] Create comprehensive Reports page
- [ ] Add user Profile management
- [ ] Implement My Reports page for users
- [ ] Integrate advanced filtering and search capabilities

### Phase 2: Analytics & Insights
- [ ] Deploy SubGraph for monitoring on-chain activities
- [ ] Implement analytics dashboard
- [ ] Add trending contracts and popular audit reports
- [ ] Create vulnerability statistics and trends

### Phase 3: Community & Collaboration
- [ ] Add commenting and discussion features
- [ ] Implement reputation system for auditors
- [ ] Create bug bounty integration
- [ ] Add collaborative audit features

### Phase 4: Advanced Features
- [ ] Real-time monitoring of contract changes
- [ ] Automated re-auditing system
- [ ] Integration with popular development tools
- [ ] Custom rule engine for security checks

## 🔮 Vision

BugHuntr.ai aims to become the go-to platform for smart contract security analysis by:

1. **Democratizing Security**: Making high-quality security analysis accessible to all developers
2. **Building Trust**: Creating a transparent and verifiable audit ecosystem
3. **Fostering Community**: Developing a knowledge base of common vulnerabilities and best practices
4. **Advancing AI**: Continuously improving our AI models with real-world security insights

## 🛠️ Technical Stack

- Frontend: Vue.js + Tailwind CSS
- Smart Contracts: Solidity
- Blockchain: AIA Chain
- AI Integration: Codestral by Mistral.ai
- Analytics: The Graph (planned)

## Screenshots

![landingpage](https://github.com/user-attachments/assets/4c5cc352-d559-4610-98a4-ae6a23658dad)
![submitted-transaction](https://github.com/user-attachments/assets/80d8c751-1d9e-438f-8979-95c6cafa2210)
![analyser](https://github.com/user-attachments/assets/8c3ed4ee-ab1c-4aaa-9abc-f07021a750d2)
![submitting](https://github.com/user-attachments/assets/5900a492-8171-49ff-984a-ddcaa28dcb58)

## Warning
These contracts are **UNSAFE** and should **NEVER** be deployed on any production network. They contain known vulnerabilities that would result in loss of funds if exploited.

# ⚠️ VULNERABLE CONTRACTS - DO NOT USE IN PRODUCTION ⚠️

These contracts contain **INTENTIONAL** security vulnerabilities for educational and testing purposes only.

## Purpose
- Demonstration of common smart contract vulnerabilities
- Testing of security tools and audit processes
- Educational reference for security researchers

## Warning
These contracts are **UNSAFE** and should **NEVER** be deployed on any production network. They contain known vulnerabilities that would result in loss of funds if exploited.

1. `SwapRouterVulnerable.sol` - Contains severe security vulnerabilities
   - Unauthorized withdrawal vulnerability
   - Reentrancy vulnerability
   - Integer overflow vulnerability
   - Unchecked return values
   - Price manipulation vulnerability

```
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/libraries/SafeCast.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';

/// @title Uniswap V3 Swap Router with intentional severe security issues
contract SwapRouterVulnerable {
    using SafeCast for uint256;
    using Path for bytes;

    address public owner;
    mapping(address => uint256) public balances;
    
    // Severe Issue 1: Public function that can drain contract
    function withdrawAll() public {
        // Missing access control - anyone can drain
        payable(msg.sender).transfer(address(this).balance);
    }
    
    // Severe Issue 2: Reentrancy vulnerability
    function swap(address token, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        // Dangerous pattern: state update after external call
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        balances[msg.sender] -= amount; // State update after external call
    }
    
    // Severe Issue 3: Integer overflow
    function deposit() public payable {
        // No overflow check when adding to balance
        balances[msg.sender] = balances[msg.sender] + msg.value;
    }

    // Severe Issue 4: Unchecked return values
    function transferTokens(address token, address to, uint256 amount) public {
        // Dangerous: Not checking return value of transfer
        IERC20(token).transfer(to, amount);
    }

    // Severe Issue 5: Potential price manipulation
    function getPrice(address pair) public view returns (uint256) {
        // Using a single DEX price without any checks
        // Vulnerable to flash loan attacks and price manipulation
        return IUniswapV3Pool(pair).slot0().sqrtPriceX96;
    }

    receive() external payable {}
}
```
![risk-score-another](https://github.com/user-attachments/assets/577580f2-950b-4c8e-8576-5aa7a83e27f6)

2. `SwapRouterMedium.sol` - Contains medium security vulnerabilities
   - Weak access control
   - Unsafe ownership transfer
   - Block timestamp dependency
   - Input validation issues
   - Centralization risks
   - DOS vulnerabilities
   - Improper validation

```
// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import '@uniswap/v3-core/contracts/libraries/SafeCast.sol';
import '@uniswap/v3-core/contracts/libraries/TickMath.sol';
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';

/// @title Uniswap V3 Swap Router with intentional medium security issues
contract SwapRouterMedium {
    using SafeCast for uint256;
    using Path for bytes;

    address public admin;
    bool public locked;
    uint256 public constant DEADLINE_GRACE_PERIOD = 1 hours;
    mapping(address => uint256) public lastActivity;
    
    constructor() {
        admin = msg.sender;
    }

    // Medium Issue 1: Weak access control
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _; 
    }

    // Medium Issue 2: Lack of two-step ownership transfer
    function transferAdmin(address newAdmin) public onlyAdmin {
        // Dangerous: Direct transfer without confirmation
        admin = newAdmin;
    }

    // Medium Issue 3: Block timestamp manipulation risk
    function isDeadlineValid(uint256 deadline) public view returns (bool) {
        // Vulnerable to miner manipulation within certain bounds
        return block.timestamp <= deadline + DEADLINE_GRACE_PERIOD;
    }

    // Medium Issue 4: Insufficient input validation
    function setUserActivity(address user, uint256 timestamp) public {
        // No bounds checking on timestamp
        lastActivity[user] = timestamp;
    }

    // Medium Issue 5: Centralization risk
    function emergencyStop() public onlyAdmin {
        // Single admin can halt all operations
        locked = true;
    }

    // Medium Issue 6: DOS potential
    function batchProcess(address[] calldata users) public {
        // No limit on array size - potential DOS
        for(uint i = 0; i < users.length; i++) {
            lastActivity[users[i]] = block.timestamp;
        }
    }

    // Medium Issue 7: Improper validation
    function processSwap(uint256 amount, uint256 minReturn) public returns (uint256) {
        // Basic slippage check but no proper decimals handling
        require(amount > 0, "Invalid amount");
        require(minReturn > 0, "Invalid minReturn");
        return amount * 99 / 100; // Simplified for demo
    }
}
```

![risks-shown](https://github.com/user-attachments/assets/28d982e2-1f1a-4c9f-a40e-f3cdb0968e09)

## 🔗 Links

- [AIA Chain Explorer](https://testnet.aiascan.com)

---
Built with ❤️ by the BugHuntr.ai team
