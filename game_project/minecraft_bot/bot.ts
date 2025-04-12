import mineflayer from "mineflayer";
import {pathfinder} from "mineflayer-pathfinder";

// Server connection details - replace with your server's address and port
const serverAddress = '192.168.1.72'; // Or your server's IP address
const serverPort = 25565; // Default Minecraft port

// Bot configuration
const botUsername = 'TypeScriptBot'; // The username the bot will use to join

// Function to create and connect the bot
function createBot(): mineflayer.Bot {
    const bot = mineflayer.createBot({
        host: serverAddress,
        port: serverPort,
        username: botUsername,
    });
    bot.loadPlugin(pathfinder);

    return bot;
}

// Main function to start the bot
function startBot(): void {
    const bot = createBot();

    // Event handler for when the bot connects to the server
    bot.on('connect' as any, () => {
        console.log(`[${botUsername}] Connected to ${serverAddress}:${serverPort}`);
    });

    // Event handler for when the bot spawns into the world
    bot.on('spawn', () => {
        console.log(`[${botUsername}] Spawned in the world`);
        bot.chat('Hello, world!'); // Send a message to the chat
    });

    // Event handler for chat messages
    bot.on('message', (jsonMsg, position) => {
        console.log(jsonMsg, position);
    });

    // Event handler for bot disconnection
    bot.on('end', () => {
        console.log(`[${botUsername}] Disconnected from the server`);
        // Optionally, you can implement a reconnect mechanism here
        // setTimeout(startBot, 5000); // Reconnect after 5 seconds
    });

    bot.on('error', (err) => {
        console.error(`[${botUsername}] Error: ${err}`);
    });
}

// Start the bot when the script is executed
startBot();
