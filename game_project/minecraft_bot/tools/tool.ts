import { Bot } from "mineflayer";
import { Tool } from "ollama";
import { Result } from "../../../common/common_ts_libs/result";
import { StatusError } from "../../../common/common_ts_libs/status_error";

export type toolFunc = (
    bot: Bot,
    args: Record<string, any>
) => Promise<Result<string, StatusError>>;

export interface ToolStruct {
    definition: Tool;
    func: toolFunc;
}
