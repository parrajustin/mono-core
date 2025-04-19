import { Bot } from "mineflayer";
import { Vec3 } from "vec3";
import { Ok, Err, Result } from "../../../common/common_ts_libs/result";
import { InvalidArgumentError, StatusError } from "../../../common/common_ts_libs/status_error";
import { WrapPromise } from "../../../common/common_ts_libs/wrap_promise";
import { WrapOptional } from "../../../common/common_ts_libs/optional";
import { ToolStruct } from "./tool";
import pathfinder from "mineflayer-pathfinder";
// # Create a new minecraft-data instance with the bot's version
// mcData = require('minecraft-data')(bot.version)
// # Create a new movements class
// movements = pathfinder.Movements(bot, mcData)

// --- Snippet: Clear and Flatten Area ---
export async function clearAndFlattenArea(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const centerOpt = WrapOptional(args["center"]);
    if (centerOpt.none) {
        return Err(InvalidArgumentError("The parameter center must be defined!"));
    }
    const centerSplit = (centerOpt.safeValue() as string).split(",") as [string, string, string];
    if (centerSplit.length !== 3) {
        return Err(InvalidArgumentError('The parameter center must of type "x,y,z"!'));
    }
    const dirOpt = WrapOptional(args["direction"]);
    const dir = dirOpt
        .andThen((val) =>
            val === "" || val !== "up" || val !== "down" || val != "above" || val !== "down"
                ? "up"
                : val
        )
        .valueOr("up");
    const radiusOpt = WrapOptional(args["radius"]);
    const radius = radiusOpt.andThen((val) => (val === "" ? "5" : val)).valueOr("5");
    const heightOpt = WrapOptional(args["height"]);
    const height = heightOpt.andThen((val) => (val === "" ? "3" : val)).valueOr(3);
    const center = new Vec3(
        Number.parseInt(centerSplit[0]),
        Number.parseInt(centerSplit[1]),
        Number.parseInt(centerSplit[2])
    );
    bot.chat(
        `Clearing and flattening a ${radius * 2 + 1}x${radius * 2 + 1} area around {x:${center.x}, y:${center.y}, z:${center.z}}`
    );

    const dirSign = dir === "up" || dir === "above" ? 1 : -1;
    bot.pathfinder.tickTimeout = 150;

    for (let y = height - 1; y >= 0; y--) {
        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                const targetPos = center.offset(x, dirSign * y, z);
                const block = bot.blockAt(targetPos);

                if (block && block.name !== "air") {
                    const movements = new pathfinder.Movements(bot);
                    bot.pathfinder.setMovements(movements);
                    const pathFinderResult = await WrapPromise(
                        bot.pathfinder.goto(
                            new pathfinder.goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 1)
                        ),
                        "Couldn't get to block"
                    );
                    if (pathFinderResult.err) {
                        return pathFinderResult;
                    }
                    if (!bot.canDigBlock(block)) {
                        console.log("Can't break block at ", block.name, targetPos.toString());
                        continue;
                    }
                    console.log("Breaking block at ", block.name, targetPos.toString());

                    const { promise, resolve } = Promise.withResolvers();
                    const digCallbackFunc = () => {
                        console.log("callback");
                        resolve(null);
                    };
                    bot.on("diggingCompleted", digCallbackFunc);
                    bot.on("blockBreakProgressObserved", (block, stage) => {
                        console.log(`Breaking block ${block.name} at ${stage}`);
                    });
                    const digResult = await WrapPromise(bot.dig(block), "Failed to have bot dig.");
                    await promise;
                    bot.removeAllListeners("blockBreakProgressObserved");
                    bot.off("diggingCompleted", digCallbackFunc);

                    if (digResult.err) {
                        return digResult;
                    }
                }
            }
        }
    }

    bot.chat("Area cleared and flattened.");
    return Ok("");
}

export function clearTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "clearAndFlattenArea",
                description:
                    "Clears an area oriented at center by removing all blocks within the box.",
                parameters: {
                    type: "object",
                    properties: {
                        center: {
                            type: "string",
                            description:
                                'A comma seperated list of the x,y,z coordinates to clear. An example input is "61,-23,42" where 61 is the x, -23 is the y, and 42 is the z.'
                        },
                        radius: {
                            type: "string",
                            description: "The radius of the box to clear. Defaults to 5"
                        },
                        height: {
                            type: "string",
                            description: "height from center of the box to clear. Defaults to 3"
                        },
                        direction: {
                            type: "string",
                            description:
                                'above or below the center line, where the box should be clear from. Options are "up", "down", "above", "below". The default should be "up"'
                        }
                    },
                    required: ["center"]
                }
            }
        },
        func: clearAndFlattenArea
    };
}
