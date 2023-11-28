import { keys } from "ts-transformer-keys";
import { type FSettings } from "./Settings.Types";
import Storage from "node-persist";
import { PromptUser, TPrompt } from "../Prompt";
import { GetSettingPrompts } from "./Setting.Prompts";

const SettingsKeys: Array<keyof FSettings> = keys<FSettings>();

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

/** Get a map of settings keys to a boolean indicating whether the value exists in settings. */
export const GetSettingsSavedStatus = async (): Promise<Map<keyof FSettings, boolean>> =>
{
    await InitializeSettingsStore();

    const SettingsPromises: Array<Promise<[ keyof FSettings, boolean ]>> = SettingsKeys.map(((SettingName: keyof FSettings): Promise<[ keyof FSettings, boolean ]> =>
    {
        return Store.getItem(SettingName).then((SettingValue: any): Promise<[ keyof FSettings, boolean ]> =>
        {
            return new Promise((Resolve, _Reject) =>
            {
                Resolve([ SettingName, SettingValue !== undefined ]);
            });
        }).catch(Error =>
        {
            return Promise.resolve([ SettingName, false ]);
        });
    }));

    return Promise.allSettled(SettingsPromises).then((SettingsSavedStatusSettled: Array<PromiseSettledResult<[ keyof FSettings, boolean ]>>): Promise<Map<keyof FSettings, boolean>> =>
    {
        const SettingsSavedStatus: Array<[ keyof FSettings, boolean ]> = SettingsSavedStatusSettled.map((SettingTuple: PromiseSettledResult<[ keyof FSettings, boolean ]>): [ keyof FSettings, boolean ] =>
        {
            return (SettingTuple as PromiseFulfilledResult<[ keyof FSettings, boolean ]>).value;
        });

        let SettingsSavedStatusMap: Map<keyof FSettings, boolean> = new Map<keyof FSettings, boolean>();
        SettingsSavedStatus.forEach((SettingsSavedTuple: [ keyof FSettings, boolean ]): void =>
        {
            SettingsSavedStatusMap.set(SettingsSavedTuple[0], SettingsSavedTuple[1]);
        });

        return Promise.resolve(SettingsSavedStatusMap);
    });
};

export const GetAllSettings = async (): Promise<Partial<FSettings>> =>
{
    await InitializeSettingsStore();

    const SettingPromises: Array<Promise<[ keyof FSettings, any | undefined ]>> = SettingsKeys.map((SettingName: keyof FSettings): Promise<[ keyof FSettings, any | undefined ]> =>
    {
        return Store.getItem(SettingName)
            .then((Setting: any): [ keyof FSettings, any | undefined ] => [ SettingName, Setting ])
            .catch((_Error: any): [ keyof FSettings, any | undefined ] => [ SettingName, undefined ]);
    });

    return Promise.allSettled(SettingPromises).then((SettledPromises: Array<PromiseSettledResult<any>>): Promise<Partial<FSettings>> =>
    {
        const Settings: Partial<FSettings> = { };

        SettingsKeys.forEach((SettingName: keyof FSettings): void =>
        {
            Settings[SettingName] = SettledPromises.map((SettledPromise: PromiseSettledResult<[ keyof FSettings, any | undefined ]>): any | undefined =>
            {
                return (SettledPromise as PromiseFulfilledResult<any | undefined>).value[1];
            })[SettingsKeys.indexOf(SettingName)];
        });

        return Promise.resolve(Settings);
    });
};

export const GetSettingOrPrompt = async <TKey extends keyof FSettings>(Setting: TKey): Promise<FSettings[TKey]> =>
{
    await InitializeSettingsStore();

    const OutSetting: FSettings[TKey] | undefined = await (Store.getItem(Setting) as Promise<FSettings[TKey] | undefined>);

    if (OutSetting === undefined)
    {
        const SettingPrompts: TPrompt<FSettings> = await GetSettingPrompts();

        Object.keys(SettingPrompts).forEach((InKey: string, Index: number): void =>
        {
            const Key: TKey = InKey as TKey;
            if (Key !== Setting)
            {
                delete SettingPrompts[Key];
            }
        });

        return ((await PromptUser(SettingPrompts)) as { [Index in TKey]: FSettings[TKey] })[Setting];
    }
    else
    {
        return OutSetting;
    }
};

export const GetSetting = async <TKey extends keyof FSettings>(Setting: TKey): Promise<FSettings[TKey] | undefined> =>
{
    await InitializeSettingsStore();

    return Store.getItem(Setting) as Promise<FSettings[TKey] | undefined>;
};

export const SetSetting = async <TKey extends keyof FSettings>(Setting: TKey, Value: FSettings[TKey]): Promise<Storage.WriteFileResult> =>
{
    await InitializeSettingsStore();

    return Store.setItem(Setting, Value);
};

export const GetSettingsStore = async (): Promise<Storage.LocalStorage> =>
{
    await InitializeSettingsStore();

    return Store;
};

export const SetMultipleSettings = async (Settings: Partial<FSettings>): Promise<PromiseSettledResult<Storage.WriteFileResult>[]> =>
{
    await InitializeSettingsStore();

    const Promises: Array<Promise<Storage.WriteFileResult>> = Object.entries(Settings).map(([ Name, Value ]) =>
    {
        return Store.setItem(Name, Value);
    });

    return Promise.allSettled(Promises);
};
