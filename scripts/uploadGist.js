const { SecretsManager, createGist } = require("@chainlink/functions-toolkit");
const ethers = require("ethers");
require("dotenv").config();

const makeRequestSepolia = async () => {
  // hardcoded for Avalanche Fuji
  const routerAddress = "0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0";
  const donId = "fun-avalanche-fuji-1";
  const rpcUrl = process.env.ETHEREUM_PROVIDER_AVALANCHEFUJI; // fetch Sepolia RPC URL

  const secrets = { apikey: process.env.SUPABASE_API_KEY };

  // Initialize ethers signer and provider to interact with the contracts onchain
  const privateKey = process.env.EVM_PRIVATE_KEY;
  if (!privateKey) throw new Error("private key not provided - check your environment variables");

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

  const wallet = new ethers.Wallet(privateKey);
  const signer = wallet.connect(provider); // create ethers signer for signing transactions

  //////// MAKE REQUEST ////////

  console.log("\nMake request...");

  // First encrypt secrets and create a gist
  const secretsManager = new SecretsManager({
    signer: signer,
    functionsRouterAddress: routerAddress,
    donId: donId,
  });
  await secretsManager.initialize();

  // Encrypt secrets
  const encryptedSecretsObj = await secretsManager.encryptSecrets(secrets);

  console.log(`Creating gist...`);
  const githubApiToken = process.env.GITHUB_API_TOKEN;
  if (!githubApiToken) throw new Error("githubApiToken not provided - check your environment variables");

  // Create a new GitHub Gist to store the encrypted secrets
  const gistURL = await createGist(githubApiToken, JSON.stringify(encryptedSecretsObj));
  console.log(`\n✅Gist created ${gistURL} . Encrypt the URLs..`);
  const encryptedSecretsUrls = await secretsManager.encryptSecretsUrls([gistURL]);

  console.log(`\n✅Secrets encrypted. URLs: ${encryptedSecretsUrls}`);
};

makeRequestSepolia().catch(e => {
  console.error(e);
  process.exit(1);
});
