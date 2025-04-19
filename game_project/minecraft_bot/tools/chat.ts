import { Bot } from "mineflayer";
import { Ok, Err, Result } from "../../../common/common_ts_libs/result";
import { InvalidArgumentError, StatusError } from "../../../common/common_ts_libs/status_error";
import { WrapOptional } from "../../../common/common_ts_libs/optional";
import { ToolStruct } from "./tool";

// --- Snippet: Clear and Flatten Area ---
export async function sendMessage(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const player = WrapOptional(args["playerName"]);
    const msg = WrapOptional(args["message"]);
    if (msg.none) {
        return Err(InvalidArgumentError("You are missing the message argument!"));
    }
    if (msg.safeValue() === "") {
        return Err(InvalidArgumentError(`The "message" argument should not be empty!`));
    }

    if (player.some && player.safeValue() !== "") {
        bot.chat(`@${player.safeValue()} => ${msg.safeValue()}`);
    } else {
        bot.chat(msg.safeValue())
    }

    return Ok("");
}

export function chatTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "sendMessage",
                description: "Sends a message in the chat.",
                parameters: {
                    type: "object",
                    properties: {
                        "playerName": {
                            type: "string",
                            description: "The user you want to direct the message to. Is optional."
                        },
                        "message": {
                            type: "string",
                            description: "The message to send, must not be empty."
                        }
                    },
                    required: ["message"]
                }
            }
        },
        func: sendMessage
    }
}
