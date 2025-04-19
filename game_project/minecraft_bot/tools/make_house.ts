import { Bot } from "mineflayer";
import { Vec3 } from "vec3";

// --- Snippet: Collect Wood ---
async function collectWood(bot: Bot): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const woodTypes = [
                "oak_log",
                "spruce_log",
                "birch_log",
                "jungle_log",
                "acacia_log",
                "dark_oak_log",
                "mangrove_log",
                "cherry_log",
                "bamboo_block"
            ];
            const target = bot.findBlock({
                matching: (block) => block && woodTypes.includes(block.name),
                maxDistance: 32 // Adjust as needed
            });

            if (!target) {
                bot.chat("No wood nearby.");
                resolve();
                return;
            }

            bot.chat(`Found ${target.displayName} at ${target.position.toString()}`);

            await bot.dig(target);
            bot.chat("Mined wood.");

            // Wait a bit for the bot to collect the item
            await new Promise((resolve) => setTimeout(resolve, 1500));

            // Collect more wood until we have enough (adjust count as needed)
            const requiredWood = 64 * 5; // Example: 5 stacks
            const currentWoodCount = bot.inventory.count(woodTypes);

            if (currentWoodCount < requiredWood) {
                console.log(
                    `Collecting more wood. Current: ${currentWoodCount}, Required: ${requiredWood}`
                );
                await collectWood(bot); // Recursively call to collect more
            }

            resolve();
        } catch (err) {
            console.error("Error collecting wood:", err);
            reject(err);
        }
    });
}

// --- Snippet: Clear and Flatten Area ---
async function clearAndFlattenArea(
    bot: Bot,
    center: Vec3,
    radius: number = 5,
    height: number = 3
): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            bot.chat(
                `Clearing and flattening a ${radius * 2 + 1}x${radius * 2 + 1} area around ${center.toString()}`
            );

            for (let x = -radius; x <= radius; x++) {
                for (let z = -radius; z <= radius; z++) {
                    for (let y = 0; y < height; y++) {
                        const targetPos = center.offset(x, -y, z);
                        const block = bot.blockAt(targetPos);

                        if (block && block.name !== "air") {
                            await bot.dig(block);
                        }
                    }
                }
            }

            bot.chat("Area cleared and flattened.");
            resolve();
        } catch (err) {
            console.error("Error clearing and flattening area:", err);
            reject(err);
        }
    });
}

// --- Snippet: Build Wooden House with Crafting Bench ---
async function buildWoodenHouse(
    bot: Bot,
    center: Vec3,
    width: number = 7,
    length: number = 7,
    height: number = 3
): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            const woodPlanks = "oak_planks"; // You can change this to your preferred wood planks
            const craftingTable = "crafting_table";

            bot.chat(
                `Building a ${width}x${length}x${height} wooden house around ${center.toString()}`
            );

            // Helper function to place a block
            async function placeBlock(pos: Vec3, blockName: string) {
                const referenceBlock = bot.blockAt(pos.down());
                if (referenceBlock && referenceBlock.name !== "air") {
                    await bot.placeBlock(referenceBlock, Vec3(0, 1, 0), {
                        item: bot.inventory.find(null, blockName)
                    });
                }
            }

            // Build the walls
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    await placeBlock(
                        center.offset(x - Math.floor(width / 2), y, -Math.floor(length / 2)),
                        woodPlanks
                    );
                    await placeBlock(
                        center.offset(x - Math.floor(width / 2), y, Math.floor(length / 2)),
                        woodPlanks
                    );
                }
                for (let z = 1; z < length - 1; z++) {
                    await placeBlock(
                        center.offset(-Math.floor(width / 2), y, z - Math.floor(length / 2)),
                        woodPlanks
                    );
                    await placeBlock(
                        center.offset(Math.floor(width / 2), y, z - Math.floor(length / 2)),
                        woodPlanks
                    );
                }
            }

            // Build the floor
            for (let x = 0; x < width; x++) {
                for (let z = 0; z < length; z++) {
                    await placeBlock(
                        center.offset(x - Math.floor(width / 2), -1, z - Math.floor(length / 2)),
                        woodPlanks
                    );
                }
            }

            // Build the roof (simple flat roof for this example)
            for (let x = 0; x < width; x++) {
                for (let z = 0; z < length; z++) {
                    await placeBlock(
                        center.offset(
                            x - Math.floor(width / 2),
                            height - 1,
                            z - Math.floor(length / 2)
                        ),
                        woodPlanks
                    );
                }
            }

            // Place a crafting bench inside (example placement - adjust as needed)
            await placeBlock(
                center.offset(1 - Math.floor(width / 2), 0, 1 - Math.floor(length / 2)),
                craftingTable
            );
            bot.chat("Crafting bench placed inside.");

            bot.chat("Wooden house built!");
            resolve();
        } catch (err) {
            console.error("Error building house:", err);
            reject(err);
        }
    });
}

export { collectWood, clearAndFlattenArea, buildWoodenHouse };
