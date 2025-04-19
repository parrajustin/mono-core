import { Bot } from "mineflayer";
import { Vec3 } from "vec3";
import { Ok, Err, Result } from "../../../common/common_ts_libs/result";
import { InvalidArgumentError, StatusError } from "../../../common/common_ts_libs/status_error";
import { WrapPromise } from "../../../common/common_ts_libs/wrap_promise";
import { WrapOptional } from "../../../common/common_ts_libs/optional";
import { ToolStruct } from "./tool";
import pathfinder, { goals } from "mineflayer-pathfinder";
import { Entity } from "prismarine-entity";

// --- Snippet: Dump Inventory At Player ---
export async function dumpInventoryAtPlayer(
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

    bot.chat(`Dumping inventory near player ${username} at ${targetPosition.toString()}`);

    const inventory = bot.inventory.items();
    if (inventory.length === 0) {
        bot.chat("My inventory is empty.");
        return Ok("Inventory was empty.");
    }

    for (const item of inventory) {
        if (item) {
            const dropResult = await WrapPromise(
                bot.tossStack(item),
                `Failed to drop item: ${item.name}`
            );
            if (dropResult.err) {
                bot.chat(`Error dropping ${item.name}: ${dropResult.val.message}`);
                return dropResult;
            }
            await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to prevent rate-limiting
        }
    }

    bot.chat("Inventory dumped.");
    return Ok("");
}

export function dumpInventoryAtPlayerTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "dumpInventoryAtPlayer",
                description:
                    "Drops the bot's entire inventory at the location of a specified player.",
                parameters: {
                    type: "object",
                    properties: {
                        username: {
                            type: "string",
                            description:
                                "The username of the player where the inventory should be dropped."
                        }
                    },
                    required: ["username"]
                }
            }
        },
        func: dumpInventoryAtPlayer
    };
}

// --- Snippet: Follow and Kill Hostiles ---
export async function followAndKillHostiles(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const usernameOpt = WrapOptional(args["username"]);
    if (usernameOpt.none) {
        return Err(InvalidArgumentError("The parameter username must be defined!"));
    }
    const username = usernameOpt.safeValue() as string;

    const followRangeOpt = WrapOptional(args["followRange"]);
    const followRange = followRangeOpt.andThen((val) => (val === "" ? "5" : val)).valueOr("5");
    const followDistance = Number.parseInt(followRange);
    if (isNaN(followDistance) || followDistance <= 0) {
        return Err(InvalidArgumentError("The parameter followRange must be a positive number!"));
    }

    const attackRangeOpt = WrapOptional(args["attackRange"]);
    const attackRange = attackRangeOpt.andThen((val) => (val === "" ? "10" : val)).valueOr("10");
    const attackDistance = Number.parseInt(attackRange);
    if (isNaN(attackDistance) || attackDistance <= 0) {
        return Err(InvalidArgumentError("The parameter attackRange must be a positive number!"));
    }

    let following = true;

    bot.chat(
        `Following player ${username} and attacking nearby hostile mobs (follow range: ${followDistance}, attack range: ${attackDistance}).`
    );
    // hostile_mobs = { mcData.entities[i] for i in mcData.entities if mcData.entities[i].type == 'hostile' }
    // bot.on("entityDead")
    
    bot.on("entityMoved", async (entity) => {
        if (!following) return;

        const targetPlayer = bot.players[username];
        if (!targetPlayer || !targetPlayer.entity) return;

        if (entity.type === "hostile") {
            const distToMob = bot.entity.position.distanceTo(entity.position);
            if (distToMob <= attackDistance) {
                following = false; // Stop following to attack
                bot.chat(`Attacking hostile mob: ${entity.name}`);
                try {
                    await WrapPromise(bot.attack(entity), `Failed to attack ${entity.name}`);
                } catch (err: any) {
                    bot.chat(`Error attacking ${entity.name}: ${err.message}`);
                } finally {
                    following = true; // Resume following after attack attempt
                }
            }
        }

        const distToPlayer = bot.entity.position.distanceTo(targetPlayer.entity.position);
        if (distToPlayer > followDistance) {
            const movements = new pathfinder.Movements(bot);
            bot.pathfinder.setMovements(movements);
            const goal = new goals.GoalNear(
                targetPlayer.entity.position.x,
                targetPlayer.entity.position.y,
                targetPlayer.entity.position.z,
                1 // Stop within 1 block of the player
            );
            await WrapPromise(bot.pathfinder.goto(goal), `Failed to reach player ${username}`);
        }
    });

    // Keep the bot alive and following until explicitly stopped
    return Ok("Following and attacking hostiles. Use a separate command to stop.");
}

export function followAndKillHostilesTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "followAndKillHostiles",
                description:
                    "Makes the bot follow a specified player and attack any nearby hostile mobs.",
                parameters: {
                    type: "object",
                    properties: {
                        username: {
                            type: "string",
                            description: "The username of the player to follow."
                        },
                        followRange: {
                            type: "string",
                            description:
                                "The distance at which the bot will start following the player. Defaults to 5."
                        },
                        attackRange: {
                            type: "string",
                            description:
                                "The maximum distance to attack hostile mobs. Defaults to 10."
                        }
                    },
                    required: ["username"]
                }
            }
        },
        func: followAndKillHostiles
    };
}

// --- Snippet: List Nearby Chests ---
export async function listNearbyChests(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const radiusOpt = WrapOptional(args["radius"]);
    const radius = radiusOpt.andThen((val) => (val === "" ? "20" : val)).valueOr("20");
    const searchRadius = Number.parseInt(radius);
    if (isNaN(searchRadius) || searchRadius <= 0) {
        return Err(InvalidArgumentError("The parameter radius must be a positive number!"));
    }

    const chestBlocks = bot.findBlocks({
        matching: (block) => block.name === "chest" || block.name === "ender_chest" || block.name === "trapped_chest",
        maxDistance: searchRadius
    });

    if (chestBlocks.length === 0) {
        bot.chat(`No chests found within a radius of ${searchRadius}.`);
        return Ok("No chests found.");
    }

    bot.chat(`Found ${chestBlocks.length} chests within a radius of ${searchRadius}:`);
    for (const pos of chestBlocks) {
        const block = bot.blockAt(new Vec3(pos.x, pos.y, pos.z));
        if (block) {
            bot.chat(`- ${block.name} at x:${pos.x}, y:${pos.y}, z:${pos.z}`);
        }
    }

    return Ok(`Listed ${chestBlocks.length} nearby chests.`);
}

export function listNearbyChestsTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "listNearbyChests",
                description: "Lists the locations of nearby chests (including normal, ender, and trapped chests).",
                parameters: {
                    type: "object",
                    properties: {
                        radius: {
                            type: "string",
                            description: "The radius within which to search for chests. Defaults to 20."
                        }
                    }
                }
            }
        },
        func: listNearbyChests
    };
}

// --- Snippet: Get Chest Items ---
export async function getChestItems(
    bot: Bot,
    args: Record<string, any>
): Promise<Result<string, StatusError>> {
    const locationOpt = WrapOptional(args["location"]);
    if (locationOpt.none) {
        return Err(InvalidArgumentError("The parameter location must be defined!"));
    }
    const locationSplit = (locationOpt.safeValue() as string).split(",") as [string, string, string];
    if (locationSplit.length !== 3) {
        return Err(InvalidArgumentError('The parameter location must be of type "x,y,z"!'));
    }
    const targetLocation = new Vec3(
        Number.parseInt(locationSplit[0]),
        Number.parseInt(locationSplit[1]),
        Number.parseInt(locationSplit[2])
    );

    const block = bot.blockAt(targetLocation);
    if (!block || (block.name !== "chest" && block.name !== "ender_chest" && block.name !== "trapped_chest")) {
        return Err(InvalidArgumentError(`No chest found at location ${targetLocation.toString()}`));
    }

    try {
        const chest = await WrapPromise(bot.openChest(block), "Failed to open the chest.");
        if (chest.err) {
            return chest;
        }

        const items = chest.val.containerItems();
        bot.chat(`Items in chest at ${targetLocation.toString()}:`);
        if (items.length === 0) {
            bot.chat("- Empty");
        } else {
            for (const item of items) {
                bot.chat(`- ${item.count} x ${item.displayName}`);
            }
        }

        await WrapPromise(chest.val.close(), "Failed to close the chest.");
        return Ok(`Listed items in chest at ${targetLocation.toString()}.`);

    } catch (error: any) {
        return Err(StatusError(`An error occurred while interacting with the chest: ${error.message}`));
    }
}

export function getChestItemsTool(): ToolStruct {
    return {
        definition: {
            type: "function",
            function: {
                name: "getChestItems",
                description: "Gets and lists the items contained within a chest at a specified location.",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: 'The x,y,z coordinates of the chest to inspect. Example: "10,64,-20".'
                        }
                    },
                    required: ["location"]
                }
            }
        },
        func: getChestItems
    };
}