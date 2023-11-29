/* File:      Task.ts
 * Author:    Gage Sorrell <gage@sorrell.sh>
 * Copyright: (c) 2023 Gage Sorrell
 * License:   MIT
 */

import { FLongTasks, TLongTask, TLongTaskData, TLongTaskDescription } from "./Task.Types";
import ora from "ora";

/**
 * Run multiple async functions serially, with descriptions and status shown with ora.
 * 
 * @param Description The description of the set of functions.
 * @param Tasks The functions to be run serially, with string-valued keys and descriptions.
 * @returns A mapped object whose keys are the keys of `T`.
 */
export const DoLongTasksInSerial = async <T extends FLongTasks>(Description: string, Tasks: TLongTaskDescription<T>): Promise<T> =>
{
    console.log(`• ${Description}`);

    const Functions: Array<[ keyof T, TLongTaskData<T, keyof T> ]> = Object.entries(Tasks);
    const Results: Partial<T> = { };

    for await (const Entry of Functions)
    {
        const PropertyName: keyof T = Entry[0];
        const Description: string = Entry[1].Description;
        const Spinner = ora(Description);
        Spinner.indent = 4;
        Spinner.start();

        const Function: TLongTask<T[keyof T]> = Entry[1].Task;

        const Result: T[keyof T] = await Function();

        Results[PropertyName] = Result;

        Spinner.stopAndPersist({ symbol: "✓" });
    }

    return Promise.resolve(Results as T);
};

/**
 * Run multiple async functions in parallel, with descriptions and status shown with ora.
 * 
 * @param Description The description of the set of functions.
 * @param Tasks The functions to be run serially, with string-valued keys and descriptions.
 * @returns A mapped object whose keys are the keys of `T`.
 */
export const DoLongTasksInParallel = async <T extends FLongTasks>(Description: string, Tasks: TLongTaskDescription<T>): Promise<T> =>
{
    console.log(`• ${Description}`);

    const Functions: Array<[ keyof T, TLongTaskData<T, keyof T> ]> = Object.entries(Tasks);

    const OutPromises: Partial<{ [ Key in keyof T ]: Promise<T[Key]> }> = { };

    Functions.forEach(([ PropertyName, Data ]) =>
    {
        const Promise = Data.Task();
        const TaskSpinner = ora(Data.Description);
        TaskSpinner.indent = 4;
        TaskSpinner.start();
        OutPromises[PropertyName] = Promise;
        TaskSpinner.stopAndPersist({ symbol: "✓" });
    });

    await Promise.allSettled(Object.values(OutPromises));

    const OutMap: Partial<T> = { };
    for await (const [ Key, Value ] of Object.entries(OutPromises))
    {
        OutMap[Key as keyof T] = await Value;
    }

    return Promise.resolve(OutMap as T);
};

/** Run an async function, showing its progress via ora. */
export const DoLongTask = async <T>(Description: string, Task: () => Promise<T>): Promise<T> =>
{
    const TaskSpinner = ora(Description).start();

    const ReturnValue: T = await Task();

    TaskSpinner.stopAndPersist({ symbol: "✓" });

    return Promise.resolve(ReturnValue);
};
