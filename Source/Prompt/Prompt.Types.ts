import { Question } from "inquirer";

type FPromptDataBase =
    Partial<Pick<Question, "default">> &
    Required<Pick<Question, "message" | "validate">>;

export type FPromptDataInput = FPromptDataBase &
{
    type: "input" | "password" | "confirm"
};

export type FPromptDataWithChoices = FPromptDataBase &
{
    choices?: Array<string> | Readonly<Array<string>>;
    type: "checkbox" | "list";
};

export type FPromptData = FPromptDataInput | FPromptDataWithChoices;

export type TPrompt<T extends object = object> = { [ Key in keyof T ]: FPromptData } & { name?: string };

export type TBranchingFunction<T> = (Children: FPromptNodeChildren | FPromptBranchTerminus, Responses: T) => Promise<TPromptNode<object>> | Promise<FPromptBranchTerminus>;

export type FPromptBranchTerminus = null;

export const PromptHasChoices = (Prompt: FPromptData): Prompt is FPromptDataWithChoices =>
{
    return Prompt.type === "checkbox" || Prompt.type === "list";
};

export type FPromptNodeChildren = { [ Index: string ]: TPromptNode<object> };

export type TPromptNode<T extends object> =
{
    Children: FPromptNodeChildren | FPromptBranchTerminus;

    ChooseChild: TBranchingFunction<T>;

    OnPromptingComplete: (Responses: T) => Promise<void>;

    Prompt: TPrompt<T>;
};

/** A node whose children have not been defined yet (nor yet explicitly stated to not have children). */
export type TPromptTwig<T extends object> = Omit<TPromptNode<T>, "Children">;
