import { PromptUser, TPrompt } from "../Prompt";
import Storage from "node-persist";
import { keys } from "ts-transformer-keys";

interface FSettingsBase extends Record<string, unknown> { }

const GetSettingsKeys = <T extends FSettingsBase>() => keys<T>();

const Store: Storage.LocalStorage = Storage.create({ dir: ".persistent" });

let IsSettingsStoreInitialized: boolean = false;

export const InitializeSettingsStore = async (): Promise<void> =>
{
    if (IsSettingsStoreInitialized)
    {
        return Promise.resolve();
    }
    else
    {
        return Store.init().then((_Value) =>
        {
            IsSettingsStoreInitialized = true;
        });
    }
};

export const GetIsSettingsStoreInitialized = (): boolean =>
{
    return IsSettingsStoreInitialized;
};

export const GetAllSettings = async <T extends FSettingsBase>(): Promise<Partial<T>> =>
{
    await InitializeSettingsStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SettingPromises: Array<Promise<[ keyof T, unknown | undefined ]>> = GetSettingsKeys<T>().map((SettingName: keyof T): Promise<[ keyof T, any | undefined ]> =>
    {
        return Store.getItem(SettingName as string)
            .then((Setting: unknown): [ keyof T, unknown | undefined ] => [ SettingName, Setting ])
            .catch((_Error: unknown): [ keyof T, unknown | undefined ] => [ SettingName, undefined ]);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.allSettled(SettingPromises).then((SettledPromises: Array<PromiseSettledResult<any>>): Promise<Partial<T>> =>
    {
        const Settings: Partial<T> = { };

        GetSettingsKeys<T>().forEach((SettingName: keyof T): void =>
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Settings[SettingName] = SettledPromises.map((SettledPromise: PromiseSettledResult<[ keyof T, any ]>): any =>
            {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return (SettledPromise as PromiseFulfilledResult<any>).value[1];
            })[GetSettingsKeys<T>().indexOf(SettingName)];
        });

        return Promise.resolve(Settings);
    });
};

export const GetSettingOrPrompt = async <T extends FSettingsBase>(Setting: keyof T, SettingPrompts: TPrompt<T>): Promise<T[keyof T]> =>
{
    await InitializeSettingsStore();

    const OutSetting: T[keyof T] | undefined = await (Store.getItem(Setting as string) as Promise<T[keyof T] | undefined>);

    if (OutSetting === undefined)
    {
        Object.keys(SettingPrompts).forEach((InKey: string): void =>
        {
            const Key: keyof T = InKey as keyof T;
            if (Key !== Setting)
            {
                delete SettingPrompts[Key];
            }
        });

        return ((await PromptUser(SettingPrompts)) as { [Index in keyof T]: T[keyof T] })[Setting];
    }
    else
    {
        return OutSetting;
    }
};

export const GetSetting = async <T extends FSettingsBase, TKey extends keyof T>(Setting: TKey): Promise<T[TKey] | undefined> =>
{
    await InitializeSettingsStore();

    return Store.getItem(Setting as string) as Promise<T[TKey] | undefined>;
};

export const SetSetting = async <T extends FSettingsBase, TKey extends keyof T>(Setting: TKey, Value: T[TKey]): Promise<Storage.WriteFileResult> =>
{
    await InitializeSettingsStore();

    return Store.setItem(Setting as string, Value);
};

export const GetSettingsStore = async (): Promise<Storage.LocalStorage> =>
{
    await InitializeSettingsStore();

    return Store;
};

export const SetMultipleSettings = async <T extends FSettingsBase>(Settings: Partial<T>): Promise<PromiseSettledResult<Storage.WriteFileResult>[]> =>
{
    await InitializeSettingsStore();

    const Promises: Array<Promise<Storage.WriteFileResult>> = Object.entries(Settings).map(([ Name, Value ]) =>
    {
        return Store.setItem(Name, Value);
    });

    return Promise.allSettled(Promises);
};
