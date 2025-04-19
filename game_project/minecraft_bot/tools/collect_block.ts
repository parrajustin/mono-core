import { Bot } from "mineflayer";
import { Vec3 } from "vec3";
import { Ok, Err, Result } from "../../../common/common_ts_libs/result";
import { InvalidArgumentError, StatusError } from "../../../common/common_ts_libs/status_error";
import { WrapPromise } from "../../../common/common_ts_libs/wrap_promise";
import { WrapOptional } from "../../../common/common_ts_libs/optional";
import { ToolStruct } from "./tool";
import pathfinder, { goals } from "mineflayer-pathfinder";

// --- Snippet: Collect Block ---
export async function collectBlock(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const blockNameOpt = WrapOptional(args["blockName"]);
    if (blockNameOpt.none) {
        return Err(InvalidArgumentError("The parameter blockName must be defined!"));
    }
    const blockName = blockNameOpt.safeValue() as string;

    const countOpt = WrapOptional(args["count"]);
    const count = countOpt.andThen((val) => (val === "" ? "1" : val)).valueOr("1");
    const targetCount = Number.parseInt(count);
    if (isNaN(targetCount) || targetCount <= 0) {
        return Err(InvalidArgumentError("The parameter count must be a positive number!"));
    }

    const radiusOpt = WrapOptional(args["radius"]);
    const radius = radiusOpt.andThen((val) => (val === "" ? "10" : val)).valueOr("10");
    const searchRadius = Number.parseInt(radius);
    if (isNaN(searchRadius) || searchRadius <= 0) {
        return Err(InvalidArgumentError("The parameter radius must be a positive number!"));
    }

    bot.chat(
        `Attempting to collect ${targetCount} ${blockName} within a radius of ${searchRadius}.`
    );

    let collectedCount = 0;

    while (collectedCount < targetCount) {
        const foundBlocks = bot.findBlocks({
            matching: (block) => {
                return (
                    bot.registry.blocksByName[blockName] != null &&
                    block.name === bot.registry.blocksByName[blockName].name
                );
            },
            maxDistance: searchRadius,
            count: 1 // Find one block at a time
        });

        if (foundBlocks.length === 0) {
            bot.chat(`Could not find any more ${blockName} within the radius.`);
            break;
        }
        const foundBlock = WrapOptional(foundBlocks[0]);
        if (foundBlock.none) {
            bot.chat(`Could not find any more ${blockName} within the radius.`);
            break;
        }

        const targetPos = new Vec3(foundBlock.safeValue().x, foundBlock.safeValue().y, foundBlock.safeValue().z);
        const blockToDig = bot.blockAt(targetPos);

        if (!blockToDig || blockToDig.name !== blockName) {
            continue; // Should not happen, but safety check
        }

        const movements = new pathfinder.Movements(bot);
        bot.pathfinder.setMovements(movements);
        const pathFinderResult = await WrapPromise(
            bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 1)),
            `Couldn't reach block at ${targetPos.toString()}`
        );

        if (pathFinderResult.err) {
            bot.chat(pathFinderResult.val.message);
            return pathFinderResult;
        }

        if (!bot.canDigBlock(blockToDig)) {
            bot.chat(`Cannot dig ${blockName} at ${targetPos.toString()}`);
            continue;
        }

        const { promise, resolve } = Promise.withResolvers();
        const digCallbackFunc = () => {
            resolve(null);
        };
        bot.on("diggingCompleted", digCallbackFunc);
        const digResult = await WrapPromise(
            bot.dig(blockToDig),
            `Failed to dig ${blockName} at ${targetPos.toString()}`
        );
        await promise;
        bot.off("diggingCompleted", digCallbackFunc);

        if (digResult.err) {
            bot.chat(digResult.val.message);
            return digResult;
        }

        collectedCount++;
        bot.chat(`Collected ${collectedCount}/${targetCount} ${blockName}.`);

        // Optional: Wait a short time before searching for the next block
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    bot.chat(`Finished collecting ${collectedCount} ${blockName}.`);
    return Ok("");
}

export function collectBlockTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "collectBlock",
                description:
                    "Collects a specified number of a given block within a certain radius.",
                parameters: {
                    type: "object",
                    properties: {
                        blockName: {
                            type: "string",
                            description: "The name of the block to collect (e.g., 'dirt', 'stone')."
                        },
                        count: {
                            type: "string",
                            description: "The number of blocks to collect. Defaults to 1."
                        },
                        radius: {
                            type: "string",
                            description:
                                "The radius within which to search for and collect the block. Defaults to 10."
                        }
                    },
                    required: ["blockName"]
                }
            }
        },
        func: collectBlock
    };
}
