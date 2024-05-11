import { airdropIfRequired } from "@solana-developers/helpers";

require("dotenv").config();

const {
    Connection,
    Transaction,
    SystemProgram,
    sendAndConfirmTransaction,
    PublicKey,
} = require("@solana/web3.js");

const { getKeypairFromEnvironment } = require("@solana-developers/helpers");
const senderKeypair = getKeypairFromEnvironment("SENDER_SECRET_KEY");
const recipientPubKey = "2Thd3jT6tcXSjB8bua9QtX6oogAEdEHWRUGxPwN3zzrD";
const recipient = new PublicKey(recipientPubKey);
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

process.stdout.write(`Connecting to the Solana platform`);
    console.log('✅ Connected to the Solana platform')
    console.log('Enter the amount to transfer (0.01 - 1): ');

export const getUserInput = (): Promise<number> => { 
    return new Promise((resolve, reject) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        readline.question('Enter the amount to transfer (0.01 - 1): ', (amount: string) => {
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount < 0.01 || parsedAmount > 1) {
                console.log('Invalid amount. Please enter a value between 0.01 and 1.');
                readline.close();
                resolve(getUserInput());
            } else {
                readline.close();
                resolve(parsedAmount);
            }
        });
    });
};

(async () => {
    try {
        const amount: number = await getUserInput();
        const lamports = Math.round(amount * 1000000000); 
        const transaction = new Transaction();
        const sendSolInstruction = SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: recipient,
            lamports: lamports,
        });
        transaction.add(sendSolInstruction);

        const signature = await sendAndConfirmTransaction(connection, transaction, [
            senderKeypair,
        ]);

        await airdropIfRequired(
            connection,
            senderKeypair.publicKey,
            1 * lamports,
            0.5 * lamports,
        );

        console.log(
            `💸 Finished! Sent ${amount} SOL (${lamports} lamports) to the address ${recipient}. `
        );
        console.log(`Transaction signature is ${signature}!`);
    } catch (error) {
        console.error("Transaction failed:", error);
    }
})();