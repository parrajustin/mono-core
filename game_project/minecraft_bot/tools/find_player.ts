import { Bot } from "mineflayer";
import { Result, Ok, Err } from "../../../common/common_ts_libs/result";
import { NotFoundError, StatusError } from "../../../common/common_ts_libs/status_error";
import { WrapOptional } from "../../../common/common_ts_libs/optional";
import { ToolStruct } from "./tool";

// --- Snippet: Clear and Flatten Area ---
async function findPlayer(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const playerName = WrapOptional(args["playerName"]);
    if (playerName.none) {
        return Err(NotFoundError("Missing required arg playerName."));
    }

    const player = WrapOptional(bot.players[playerName.safeValue()]);
    if (player.none) {
        return Err(
            NotFoundError(
                `Could not find the player "${playerName.safeValue()}" in the entity list.`
            )
        );
    }

    return Ok(
        `${playerName.safeValue()} is at {x: ${player.safeValue().entity.position.x}, y: ${player.safeValue().entity.position.y}, z: ${player.safeValue().entity.position.z}}`
    );
}

export function findPlayerTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "findPlayerPosition",
                description: "Gets the players position in the minecraft world.",
                parameters: {
                    type: "object",
                    properties: {
                        playerName: {
                            type: "string",
                            description: "The username of the player within minecraft."
                        }
                    },
                    required: ["playerName"]
                }
            }
        },
        func: findPlayer
    };
}

//  "tools": [
//     {
//       "type": "function",
//       "function": {
//         "name": "get_current_weather",
//         "description": "Get the current weather for a location",
//         "parameters": {
//           "type": "object",
//           "properties": {
//             "location": {
//               "type": "string",
//               "description": "The location to get the weather for, e.g. San Francisco, CA"
//             },
//             "format": {
//               "type": "string",
//               "description": "The format to return the weather in, e.g. 'celsius' or 'fahrenheit'",
//               "enum": ["celsius", "fahrenheit"]
//             }
//           },
//           "required": ["location", "format"]
//         }
//       }
//     }
//   ]
