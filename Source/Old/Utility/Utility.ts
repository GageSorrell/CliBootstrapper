import ora from "ora";
import { type FPromptData, type TPrompt } from "../Prompt";
import { join } from "path";
import { promises as fsPromises } from "fs";
import { tmpdir } from "os";

export const QuestionFromPrompt = <T extends Object>(Prompt: TPrompt<T>): Array<FPromptData> =>
{
    return Object.entries(Prompt).map(([ Name, Value ]) =>
    {
        const NewValue = { ...(Value as any) };
        NewValue.name = Name;

        return NewValue as FPromptData;
    });
};

export const ForEachAsync = async <T extends Object, U>(InArray: Array<T>, InFunction: (Item: T) => Promise<U>): Promise<Array<PromiseSettledResult<Awaited<U>>>> =>
{
    const Promises: Array<Promise<U>> = InArray.map(InFunction);

    return Promise.allSettled(Promises).then((Values) => Values);
};

export const DoLongTask = <T extends (...Arguments: Array<any>) => any>(Description: string, InFunction: T, ...Arguments: Parameters<T>): ReturnType<T> =>
{
    const Spinner = ora(Description).start();
    const ReturnValue: ReturnType<T> = InFunction(); 
    Spinner.stop();
    return ReturnValue;
};

export const DoLongTaskAsync = async <T extends (...Arguments: Array<any>) => Promise<any>>(Description: string, InFunction: T, ...Arguments: Parameters<T>): Promise<ReturnType<T>> =>
{
    const Spinner = ora(Description).start();
    const ReturnValue: ReturnType<T> = await InFunction(...Arguments); 
    Spinner.stopAndPersist({ symbol: "✓" });
    return Promise.resolve(ReturnValue);
};

export type TRef<T> = { Ref: T };

export const MakeRef = <T>(Input: T): TRef<T> =>
{
    return { Ref: Input };
};

export const GetEmptyTempDirectory = async (): Promise<string> =>
{
    const RandomString: string = GenerateRandomLetters(10);
    const NewEmptyDirectory: string = join(tmpdir(), RandomString);
    await fsPromises.mkdir(NewEmptyDirectory);

    return NewEmptyDirectory;
};

export const GenerateRandomLetters = (length: number): string =>
{
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);
        result += alphabet[randomIndex];
    }
    return result;
}

/**
 * Construct an object by taking an `Omit<T, ...>`'d object, and an object of the remaining properties. 
 */
export const FillOmitted = <T, U extends keyof T>(ObjectWithPropertiesOmitted: Omit<T, U>, ObjectWithOmittedProperties: Pick<T, U>): T =>
{
    return { ...ObjectWithOmittedProperties, ...ObjectWithPropertiesOmitted } as T;
};

/** For prompts, when the input is always valid. */
export const AlwaysValid = (_Input: unknown) => true;
