import inquirer from "inquirer";
import { QuestionFromPrompt } from "../Utility";
import { TPrompt } from "./Prompt.Types";

export const PromptUser = async <T extends object>(Prompts: TPrompt<T>): Promise<Partial<T>> =>
{
    return inquirer.prompt(QuestionFromPrompt(Prompts)) as Promise<Partial<T>>;
};
