

/**STEPS**/ 
- Run <nvm use> if you have nvm or just use node v12.0.0
- Install dependencies <npm install>
- Compile Staketime.sol and Token.sol <npx hardhat compile>
- Run test from /test/test.js <npx hardhat test>
- In main repository create .env file 
- Fill .env with appropriate data for your setup and for rinkeby:
NODEENDPOINT=<node_provider>
PRIVADMINKEY=<privkey>
TOKENADDR=<erc20_token_addr>
- Uncomment 22 line in /hardhat.config.js
- Run deployment <npx hardhat run scripts/deploy.js --network rinkeby>
***
- You can also run in separate terminal <npx hardhat node>
- Run token deployment <npx hardhat run scripts/deploytoken.js --network localhost>
- Copy token address from terminal output and paste it to .env in TOKENADDR:
- Run staking contract deployment <npx hardhat run scripts/deploy.js --network localhost>