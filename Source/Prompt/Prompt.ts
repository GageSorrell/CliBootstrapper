/* File:      Prompt.ts
 * Author:    Gage Sorrell <gage@sorrell.sh>
 * Copyright: (c) 2023 Gage Sorrell
 * License:   MIT
 */

import { FPromptBranchTerminus, FPromptData, FPromptNodeChildren, TPrompt, TPromptNode, TPromptTwig } from "./Prompt.Types";
import inquirer from "inquirer";

/**
 * Used to link nodes to make a tree.
 * By doing the linking this way, instead of defining the structure and content
 * all in one pass, we keep type safety.
 * 
 * You might wish to make a copy of this function with a shorter name.
 */
export const MakeBranch = <T extends object>(Twig: TPromptTwig<T>, Children: FPromptNodeChildren | FPromptBranchTerminus): TPromptNode<T> =>
{
    return Children !== undefined
        ? { ...Twig, Children }
        : { ...Twig, Children: null };
};

export const PromptFromTree = async <T extends object>(Node: TPromptNode<T>): Promise<void> =>
{
    const Question: Array<FPromptData> = QuestionFromPrompt(Node.Prompt);

    const Responses: T = await inquirer.prompt(Question) as T;

    await Node.OnPromptingComplete(Responses);

    const NewNode: TPromptNode<object> | null = await Node.ChooseChild(Node.Children, Responses);

    if (NewNode !== null)
    {
        await PromptFromTree(NewNode);
    }
    
    Promise.resolve();
};

export const QuestionFromPrompt = <T extends object>(Prompt: TPrompt<T>): Array<FPromptData> =>
{
    return Object.entries(Prompt).map(([ Name, Value ]) =>
    {
        const NewValue = { ...(Value as any) };
        NewValue.name = Name;

        return NewValue as FPromptData;
    });
};

export const PromptUser = async <T extends object>(Prompts: TPrompt<T>): Promise<Partial<T>> =>
{
    return inquirer.prompt(QuestionFromPrompt(Prompts)) as Promise<Partial<T>>;
};
