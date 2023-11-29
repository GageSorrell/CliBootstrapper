/* File:      Task.Types.ts
 * Author:    Gage Sorrell <gage@sorrell.sh>
 * Copyright: (c) 2023 Gage Sorrell
 * License:   MIT
 */

export type TLongTask<T> = () => Promise<T>;

export type TLongTaskData<T extends FLongTasks, U extends keyof T> =
{
    Description: string;
    Task: TLongTask<T[U]>;
};

export type TLongTaskDescription<T extends FLongTasks> =
{
    [ Key in keyof T ]: TLongTaskData<T, Key>;
};

export type FLongTasks = { [ Key: string ]: unknown };
