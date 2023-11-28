import { DeclareCommands } from "./Commands/Commands";
import { ConfigureEnvironment } from "./ConfigureEnvironment";
import { InitializeSettingsStore } from "./Settings";

export const Main = (): void =>
{
    InitializeSettingsStore()
    .then(() => DeclareCommands());
    // .then(() => ConfigureEnvironment())
    // .then(() => EnterToolByArgumentsVector());
};
