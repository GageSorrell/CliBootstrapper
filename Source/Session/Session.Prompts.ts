import { pascalCase } from "change-case";
import { TPrompt } from "../Prompt/Prompt.Types";
import { FSession } from "./Session.Types";

export const SessionPrompts: TPrompt<FSession> =
{
    FeatureName:
    {
        message: "What will be the name of this new feature?",
        type: "input",
        validate: (Input: string): true | string =>
        {
            if (typeof Input !== "string")
            {
                return "Input is not a string.";
            }

            const IsPascalCase: boolean = Input === pascalCase(Input);

            return IsPascalCase
                ? true
                : "The package name must be in PascalCase.";
        }
    }
};
