import { FSettings, SetMultipleSettings } from "../Settings";
import { PromptUser, TPrompt } from "../Prompt";
import { GetSettingPrompts } from "../Settings/Setting.Prompts";
import { keys } from "ts-transformer-keys";

export const PromptSettings = async (): Promise<void> =>
{
    const Prompts: Partial<TPrompt<FSettings>> = await GetSettingPrompts();
    keys<FSettings>().forEach(Key =>
    {
        if (Prompts[Key]?.DeferPrompt)
        {
            delete Prompts[Key];
        }
    });

    return PromptUser<Partial<FSettings>>(Prompts).then((Settings: Partial<FSettings>) =>
    {
        return SetMultipleSettings(Settings).then(_Values => Promise.resolve());
    });
};
