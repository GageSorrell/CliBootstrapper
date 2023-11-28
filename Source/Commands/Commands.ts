/* File:      Commands.ts
 * Author:    Gage Sorrell <gage@sorrell.sh>
 * Copyright: (c) 2023 Gage Sorrell.
 *            All Rights Reserved.
 */

import { FCommand, FCommandDetails, FCommandNoun, FCommandPrompts, FCommandVerb } from "./Commands.Types";
import { Command } from "commander";

export const DeclareCommands = () =>
{
    const Program = new Command();

    const HelpText: string = "\n  <noun> is one of either:\n      feature   a set of plugins, some of which go into the game.\n      resource  an external plugin, hosted on S3, or an external GitHub repo.\n      tool      an editor tool, or CLI like this tool.";

    const Commands: FCommand =
    {
        add:
        {
            Action: (Noun: FCommandNoun): void =>
            {
                switch(Noun)
                {
                    case "feature":
                        break;
                    case "tool":
                        break;
                    case "resource":
                        break;
                }
            },
            Description: "Add a new <noun> to Sanctifi."
        },
        delete:
        {
            Action: (Noun: FCommandNoun): void =>
            {
                console.log(`Selected delete ${Noun}`);
            },
            Description: "Remove a <noun> from Sanctifi."
        },
        modify:
        {
            Action: (Noun: FCommandNoun): void =>
            {
                console.log(`Selected modify ${Noun}`);
            },
            Description: "Modify a <noun> from Sanctifi."
        }
    }

    Object.entries(Commands).forEach(([ InVerb, { Action, Description }]: [ string, FCommandDetails ]) =>
    {
        const Verb: FCommandVerb = InVerb as FCommandVerb;

        Program
        .command(`${Verb} <noun>`)
        .description(Description)
        .action(Action);
    });

    Program.addHelpText("afterAll", HelpText);

    Program.parse();
};
