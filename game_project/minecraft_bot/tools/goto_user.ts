import { Bot } from "mineflayer";
import { Ok, Err, Result } from "../../../common/common_ts_libs/result";
import { InvalidArgumentError, StatusError } from "../../../common/common_ts_libs/status_error";
import { WrapPromise } from "../../../common/common_ts_libs/wrap_promise";
import { WrapOptional } from "../../../common/common_ts_libs/optional";
import { ToolStruct } from "./tool";
import pathfinder, { goals } from "mineflayer-pathfinder";

// --- Snippet: Go To User ---
export async function goToUser(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const usernameOpt = WrapOptional(args["username"]);
    if (usernameOpt.none) {
        return Err(InvalidArgumentError("The parameter username must be defined!"));
    }
    const username = usernameOpt.safeValue() as string;

    const targetPlayer = bot.players[username];
    if (!targetPlayer) {
        return Err(InvalidArgumentError(`Player "${username}" not found!`));
    }

    const targetPosition = targetPlayer.entity.position;

    bot.chat(`Going to player ${username} at ${targetPosition.toString()}`);

    const movements = new pathfinder.Movements(bot);
    bot.pathfinder.setMovements(movements);
    const pathFinderResult = await WrapPromise(
        bot.pathfinder.goto(new goals.GoalNear(targetPosition.x, targetPosition.y, targetPosition.z, 3)),
        `Failed to reach player ${username}`
    );

    if (pathFinderResult.err) {
        bot.chat(pathFinderResult.val.message);
        return pathFinderResult;
    }

    bot.chat(`Reached player ${username}.`);
    return Ok("");
}

export function goToUserTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "goToUser",
                description: "Navigates the bot to a specified player.",
                parameters: {
                    type: "object",
                    properties: {
                        username: {
                            type: "string",
                            description: "The username of the player to go to."
                        }
                    },
                    required: ["username"]
                }
            }
        },
        func: goToUser
    };
}