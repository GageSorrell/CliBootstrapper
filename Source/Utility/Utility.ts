import { FLongTasks, TLongTask, TLongTaskData, TLongTaskDescription } from "./Utility.Types";
import ora from "ora";

export const DoLongTasksInSerial = async <T extends FLongTasks>(Description: string, Tasks: TLongTaskDescription<T>): Promise<T> =>
{
    // const Spinner = ora(Description).start();
    console.log(`- ${Description}`);

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

    // Spinner.stopAndPersist({ symbol: "✓" });

    return Promise.resolve(Results as T);
};

export const DoLongTasksInParallel = async <T extends FLongTasks>(Description: string, Tasks: TLongTaskDescription<T>): Promise<T> =>
{
    // const Spinner = ora(Description).start();
    console.log(`- ${Description}`);

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

    // Spinner.stopAndPersist({ symbol: "✓" });
    return Promise.resolve(OutMap as T);
};