import { Question } from "inquirer";

type FPromptDataBase = Partial<Pick<Question, "default">> & Required<Pick<Question, "message" | "validate">> & { DeferPrompt?: boolean; };

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

export type TBranchingFunction<T extends object = object> = (Responses: T) => Promise<FPromptNodeBase> | Promise<FPromptBranchTerminus>;

export type FPromptBranchTerminus = null;

export const PromptHasChoices = (Prompt: FPromptData): Prompt is FPromptDataWithChoices =>
{
    return Prompt.type === "checkbox" || Prompt.type === "list";
};

export interface FPromptNodeBase { }

export type TPromptNode<T extends object> = FPromptNodeBase & TPrompt<T> &
{
    /**
     * These should always be `TPromptNode` or `FPromptBranchTerminus`,
     * but in the case of `TPromptNode`, the template parameter varies.
     */
    Children: Array<FPromptNodeBase> | FPromptBranchTerminus;

    /** The function that should return a value from `Children`, or `FPromptBranchTerminus`. */
    ChooseChild: TBranchingFunction<T>;
}
