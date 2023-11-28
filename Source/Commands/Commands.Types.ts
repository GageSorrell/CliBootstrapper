/* File:      Commands.Types.ts
 * Author:    Gage Sorrell <gage@sorrell.sh>
 * Copyright: (c) 2023 Gage Sorrell.
 *            All Rights Reserved.
 */

import { FPromptData } from "../Prompt";

export type FCommandNoun = "feature" | "tool" | "resource";
export const CommandNouns: Readonly<Array<FCommandNoun>> = [ "feature", "tool", "resource" ] as const;

export type FCommandVerb = "add" | "delete" | "modify";
export const CommandVerbs: Readonly<Array<FCommandVerb>> = [ "add", "delete", "modify" ] as const;

export type FCommand = { [ Key in FCommandVerb ]: FCommandDetails };

export type FCommandDetails =
{
    Action: (Noun: FCommandNoun) => void;
    Description: string;
};

export type FCommandPrompts =
{
    [ Key in FCommandVerb ]:
    {
        [ Key in FCommandNoun ]: FPromptData
    }
};
