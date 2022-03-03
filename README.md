# CLOUD9(C9) ICO BACKEND

**Table of Contents**

[Overview](#overview)<br>
[ICO Details](#ico-details)<br>
[Smart Contracts](#smart-contracts)<br>
[Project Setup](#project-setup)<br>
[Hardhat Setup](#hardhat-setup)<br>
[Documentation](#documentation)<br>
## **Overview**

Cloud 9 (C9)’s vision is to lead the world's first and equally the biggest crypto hedge fund with focal points in providing consumer-focused Defi products. Our custom-developed hybrid blockchain will cater to our Cloud 9 app and in future projects that will be built on Cloud 9 blockchain. 

The blockchain itself is designed hybrid to be the best of our vision and benefits, combined with the scalability of the current blockchain network existing today.

Cloud9 blockchain ICO is to create an ICO on polygon chain with an investor panel, users would be allowed to participate in ICO using native matic tokens or USD from debit or credit card.

***
## **ICO Details**

Total supply of C9 token is 10,000,000,000 (10B) C9 tokens. 36% is allocated to ICO part and devided into 6 phases.

Phase | Percentage | Tokens Allocated
--- | --- | ---
*Phase 1*   |`1.0%` |   **100000000**
*Phase 2*   |`2.5%` |   **250000000**
*Phase 3*   |`3.0%` |   **300000000**
*Phase 4*   |`4.5%` |   **450000000**
*Phase 5*   |`5.0%` |   **500000000**
*Phase 6*   |`20.0%`|   **2000000000**

***
## **Smart Contracts**
Smart contracts are deployed on [Polygon Testnet](https://mumbai.polygonscan.com)

- Cloud9 Token Contract - [0xa2F276F9B5E7dF96271398140399925e655e31c3](https://mumbai.polygonscan.com/address/0xa2F276F9B5E7dF96271398140399925e655e31c3)
- Cloud9 ICO Contract - [0x406e5FF58036eeE55E9c11a9927943130350d3Ac](https://mumbai.polygonscan.com/address/0x406e5FF58036eeE55E9c11a9927943130350d3Ac)
***
## **Project Setup**

Backend is written in Nodejs with MongoDB as a Database and 
**For setting up the project**

_This step presumes that node related all the prerequisites are installed in the machine._

1. Clone the clod9-backend repo:
```
git clone https://github.com/SoluLab/cloud9-backend.git
```
2. Go to the directory:
```
cd cloud9-backend
```
3. Install dependencies
```
npm install
```
4. Setup the environment file for your project
```
Check the .env.example file.
Create .env file with vim .env command
Configure all the values.
```
5. Start the backend server
```
npm start
```

Your server will start listening on port 3000.
***
## **Hardhat Setup**

This project demonstrates an hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with two contracts: c9 token & c9 ico contract, a test for those contract, scripts to deploy those contract on matic testnet, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat clean
npx hardhat compile
npx hardhat run --network mumbai scripts/c9Token.js
npx hardhat run --network mumbai scripts/c9ICO.js
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS "CloudNine"
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS "CloudNineICO"
```

***

## **Documentation**

* Postman Collection Link: [cloud9-postman-backend](https://www.getpostman.com/collections/ec6b486123b46705d7a2)
* Postman Documentation Link: [cloud9-backend](https://documenter.getpostman.com/view/3955547/UVeMK4r2)