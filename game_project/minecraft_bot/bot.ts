import mineflayer from "mineflayer";
import { pathfinder } from "mineflayer-pathfinder";
// import { Message, Ollama, Tool, ToolCall } from "ollama";
// import { findPlayerTool } from "./tools/find_player";
// import { clearTool } from "./tools/clear_and_flatten_area";
// import { chatTool, sendMessage } from "./tools/chat";
// import { collectBlockTool } from "./tools/collect_block";
// import { goToUserTool } from "./tools/goto_user";
// import { WrapPromise } from "../../common/common_ts_libs/wrap_promise";
// import { Optional, WrapOptional } from "../../common/common_ts_libs/optional";
// import { ToolStruct, toolFunc } from "./tools/tool";
// import { StatusError } from "../../common/common_ts_libs/status_error";
// import { Result } from "../../common/common_ts_libs/result";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { mineflayer as mineflayerViewer } from "prismarine-viewer";


// Server connection details - replace with your server's address and port
const serverAddress = "192.168.1.72"; // Or your server's IP address
const serverPort = 25565; // Default Minecraft port
// Bot configuration
const botUsername = "MineBot"; // The username the bot will use to join

// Function to create and connect the bot
function createBot(): mineflayer.Bot {
    const bot = mineflayer.createBot({
        host: serverAddress,
        port: serverPort,
        username: botUsername
    });
    bot.loadPlugin(pathfinder);

    return bot;
}

// Main function to start the bot
function startBot(): void {
    const bot = createBot();

    // Event handler for when the bot connects to the server
    bot.on("connect" as any, () => {
        console.log(`[${botUsername}] Connected to ${serverAddress}:${serverPort}`);
    });

    bot.once('spawn', () => {
      mineflayerViewer(bot, { port: 3000 }) // Start the viewing server on port 3000
    
      // Draw the path followed by the bot
      const path = [bot.entity.position.clone()]
      bot.on('move', () => {
        const lastPath = path[path.length - 1];
        if (lastPath === undefined) {
            return;
        }
        if (lastPath.distanceTo(bot.entity.position) > 1) {
          path.push(bot.entity.position.clone());
          (bot as any).viewer.drawLine('path', path);
        }
      });
    });

    // Event handler for bot disconnection
    bot.on("end", () => {
        console.log(`[${botUsername}] Disconnected from the server`);
        // Optionally, you can implement a reconnect mechanism here
        // setTimeout(startBot, 5000); // Reconnect after 5 seconds
    });

    bot.on("error", (err) => {
        console.error(`[${botUsername}] Error: ${err}`);
    });
}

// Start the bot when the script is executed
startBot();

// const bot = mineflayer.createBot({
//     username: 'Bot'
//   })
  
//   bot.once('spawn', () => {
//     mineflayerViewer(bot, { port: 3000 }) // Start the viewing server on port 3000
  
//     // Draw the path followed by the bot
//     const path = [bot.entity.position.clone()]
//     bot.on('move', () => {
//       if (path[path.length - 1].distanceTo(bot.entity.position) > 1) {
//         path.push(bot.entity.position.clone())
//         bot.viewer.drawLine('path', path)
//       }
//     })
//   })

// const genAI = new GoogleGenerativeAI("AIzaSyDrxoFBxuEHeGNBQtBsrcqnyYskNOZw86I");
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// // const ollama = new Ollama({ host: "http://192.168.1.72:11434" });
// // const model = "llama3.2";
// // ollama
// // .pull({ stream: true, model })
// // .then(async (v) => {
// //     for await (const resp of v) {
// //         console.log(resp);
// //     }
// // })
// // .catch((e) => {
// //     throw e;
// // });

// // Server connection details - replace with your server's address and port
// const serverAddress = "192.168.1.72"; // Or your server's IP address
// const serverPort = 25565; // Default Minecraft port

// // Bot configuration
// const botUsername = "OllamaBot"; // The username the bot will use to join

// // Function to create and connect the bot
// function createBot(): mineflayer.Bot {
//     const bot = mineflayer.createBot({
//         host: serverAddress,
//         port: serverPort,
//         username: botUsername
//     });
//     bot.loadPlugin(pathfinder);

//     return bot;
// }

// const systemPrompt = `You are a helpful bot in minecraft called "OllamaBot". Your purpose is to help the players within the game achieve whatever they want. You have an assortment of tools at your dispoal that serve as the building blocks to achieve their goals. If you want to speak in chat by replying to the user make sure you use the "sendMessage" tool. Your creator was Justin.`;

// function buildChatMessagePrompt(username: string, chatMessage: string): Message {
//     return {
//         role: "user",
//         content: `From "${username}" says:\n${chatMessage}`
//     };
// }

// function buildToolReply(call: ToolCall, result: Result<string, StatusError>): Message {
//     console.log("full tool: ", result);
//     if (result.err) {
//         return {
//             role: "tool",
//             content: `tool "${call.function.name}" had the following failure ${result.val.toString(false)}`
//         };
//     }

//     let returnValue = "";
//     if (result.safeUnwrap().length > 0) {
//         returnValue = ` returned: ${result.safeUnwrap()}`;
//     }
//     return {
//         role: "tool",
//         content: `tool "${call.function.name}" succeeded${returnValue}.`
//     };
// }

// const previousMessages: Message[] = [
//     {
//         role: "system",
//         content: systemPrompt
//     }
// ];

// // SETUP TOOLS
// const chatTools: Tool[] = [];
// const nameToTool = new Map<string, toolFunc>();
// const addTool = (struct: ToolStruct) => {
//     chatTools.push(struct.definition);
//     nameToTool.set(struct.definition.function.name, struct.func);
//     previousMessages.push({
//         role: "system",
//         content: `You have the tool ${struct.definition.function.name} which can "${struct.definition.function.description}"`
//     });
// };
// addTool(findPlayerTool());
// addTool(chatTool());
// addTool(clearTool());
// addTool(collectBlockTool());
// addTool(goToUserTool());

// let isInChat = false;

// async function ChatLoop(bot: mineflayer.Bot, toolCalls: Optional<ToolCall[]>) {
//     if (toolCalls.some && toolCalls.safeValue().length > 0) {
//         for (const tool of toolCalls.safeValue()) {
//             const toolFuncOpt = WrapOptional(nameToTool.get(tool.function.name));
//             if (toolFuncOpt.none) {
//                 throw `Failed to find tool ${JSON.stringify(tool)}`;
//             }
//             const toolFunc = toolFuncOpt.safeValue();
//             const toolReturn = await toolFunc(bot, tool.function.arguments);
//             const toolMessage = buildToolReply(tool, toolReturn);
//             console.log(`\n[Tool resp]: `, JSON.stringify(toolMessage));
//             previousMessages.push();
//         }

//         const chatResponse = await WrapPromise(
//             ollama.chat({
//                 model,
//                 stream: false,
//                 messages: previousMessages,
//                 tools: chatTools
//             }),
//             "Failed to complete ollama chat"
//         );
//         if (chatResponse.err) {
//             console.error(chatResponse.val.toString());
//             throw chatResponse.err;
//         }
//         console.log(`\n[Response from loop]: `, JSON.stringify(chatResponse.val));
//         previousMessages.push(chatResponse.safeUnwrap().message);

//         const newToolCalls = WrapOptional(chatResponse.safeUnwrap().message.tool_calls);
//         if (newToolCalls.some && newToolCalls.safeValue().length > 0) {
//             await ChatLoop(bot, newToolCalls);
//         } else if (chatResponse.safeUnwrap().message.content.length > 0) {
//             await sendMessage(bot, { message: chatResponse.safeUnwrap().message.content });
//         }
//     }
// }

// // Main function to start the bot
// function startBot(): void {
//     const bot = createBot();

//     // Event handler for when the bot connects to the server
//     bot.on("connect" as any, () => {
//         console.log(`[${botUsername}] Connected to ${serverAddress}:${serverPort}`);
//     });

//     // Event handler for when the bot spawns into the world
//     bot.on("spawn", () => {
//         console.log(`[${botUsername}] Spawned in the world`);
//         bot.chat("Hello, world!"); // Send a message to the chat
//     });

//     // Event handler for chat messages
//     bot.on("chat", async (username: string, message: string) => {
//         if (isInChat || username === botUsername) {
//             return;
//         }
//         console.log(`[Recieved]: from ${username} "${message}"`);
//         if (message.indexOf("bot") !== -1) {
//             isInChat = true;
//             console.log(`\n[Sending to ollama]`);
//             const builtMessage = buildChatMessagePrompt(username, message);
//             previousMessages.push(builtMessage);
//             const chatResponse = await WrapPromise(
//                 ollama.chat({
//                     model,
//                     stream: false,
//                     messages: previousMessages,
//                     tools: chatTools
//                 }),
//                 "Failed to complete ollama chat"
//             );
//             if (chatResponse.err) {
//                 console.error(chatResponse.val.toString());
//                 throw chatResponse.err;
//             }
//             console.log(`\n[Response]: `, JSON.stringify(chatResponse.val));
//             previousMessages.push(chatResponse.safeUnwrap().message);

//             const toolCalls = WrapOptional(chatResponse.safeUnwrap().message.tool_calls);
//             if (toolCalls.some && toolCalls.safeValue().length > 0) {
//                 await ChatLoop(bot, toolCalls);
//             } else if (chatResponse.safeUnwrap().message.content.length > 0) {
//                 await sendMessage(bot, { message: chatResponse.safeUnwrap().message.content });
//             }

//             isInChat = false;
//         }
//     });

//     // Event handler for bot disconnection
//     bot.on("end", () => {
//         console.log(`[${botUsername}] Disconnected from the server`);
//         // Optionally, you can implement a reconnect mechanism here
//         // setTimeout(startBot, 5000); // Reconnect after 5 seconds
//     });

//     bot.on("error", (err) => {
//         console.error(`[${botUsername}] Error: ${err}`);
//     });
// }

// // Start the bot when the script is executed
// startBot();
