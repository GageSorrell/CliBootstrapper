import { CreateUnrealProject } from "../CreateUnrealProject/CreateUnrealProject";
import { PromptSettings } from "./PromptSettings";

export const ConfigureEnvironment = async () =>
{
    await PromptSettings();
    await CreateUnrealProject();
};
