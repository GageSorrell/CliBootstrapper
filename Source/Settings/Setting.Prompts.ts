import { type FSettings, GetSetting} from ".";
import { AlwaysValid, ForEachAsync } from "../Utility";
import { FPromptDataCheckbox, type TPrompt } from "../Prompt";
import { keys } from "ts-transformer-keys";
import fs from "fs";
import isValidPath from "is-valid-path";
import path from "path";
import { GetRepos } from "../Git/GitClient";

const SettingPrompts: TPrompt<FSettings> =
{
    AwsAccessKey:
    {
        message: "What is your AWS Access Key for using the S3 bucket associated with this tool?",
        type: "password",
        validate: AlwaysValid
    },
    AwsSecret:
    {
        message: "What is your AWS Secret for using the S3 bucket associated with this tool?",
        type: "password",
        validate: AlwaysValid
    },
    Dependencies:
    {
        DeferPrompt: true,
        choices: [ ],
        message: "On what plugins does this feature depend?",
        type: "checkbox",
        validate: (_Input: unknown): true | string => true
    },
    FeatureDescription:
    {
        message: "What is the description of the feature?",
        type: "input",
        validate: (_Input: unknown): true | string => true
    },
    FeatureName:
    {
        message: "What is the name of the feature?",
        type: "input",
        validate: (_Input: unknown): true | string => true
    },
    GitHubToken:
    {
        message: "Please enter your GitHub Auth Token for the GageSorrell account.",
        type: "password",
        validate: (Input: unknown): true | string =>
        {
            return typeof Input === "string"
                ? true
                : "Input is not a string.";
        }
    },
    ParentDirectory:
    {
        message: "What should the parent directory of the feature's local copy be?",
        type: "input",
        validate: (Input: unknown): true | string =>
        {
            try
            {
                const TestPath: string = path.join(Input as string, "Test");
                fs.mkdirSync(TestPath);
                fs.rmdirSync(TestPath);
                
                return true;
            }
            catch (Error: unknown)
            {
                return "Directory could not be created.";
            }
        }
    },
    SanctifiPath:
    {
        message: "Where is the Sanctifi project located on this machine?",
        type: "input",
        validate: (Input: any): true | string =>
        {
            const InputString: string | undefined = Input as string | undefined;
            if (InputString)
            {
                const IsPathValid: boolean = isValidPath(InputString);
                if (IsPathValid)
                {
                    const UProjectRelativePath: string = "SO.uproject";
                    const CombinedPath: string = path.join(InputString, UProjectRelativePath);
                    const IsPathToProject: boolean = fs.existsSync(CombinedPath);

                    return IsPathToProject
                        ? true
                        : "The path is valid, but it does not point to the Sanctifi project.";
                }
                else
                {
                    return "The input is not a valid path.";
                }
            }

            return "The input is not a string.";
        }
    },
    UeInstallPath:
    {
        message: "Where is the Unreal Engine installed on this machine?",
        type: "input",
        validate: (Input: unknown): true | string =>
        {
            const InputString: string = Input as string;
            const IsPathValid: boolean = isValidPath(InputString);
            console.log(`Is Path valid, ${IsPathValid} ${Input}`);
            if (IsPathValid)
            {
                const UnrealEditorRelativePath: string = "Engine\\Binaries\\Win64\\UnrealEditor.exe";
                const UnrealEditorPath: string = path.join(InputString, UnrealEditorRelativePath);
                const UnrealEditorExists: boolean = fs.existsSync(UnrealEditorPath);

                return UnrealEditorExists
                    ? true
                    : "The provided path does not contain the Unreal Engine.";
            }
                    
            return "The provided path is not valid.";
        }
    }
};

export const GetSettingPrompts = async (): Promise<TPrompt<FSettings>> =>
{
    const Copy: TPrompt<FSettings> = { ...SettingPrompts };
    await ForEachAsync(keys<FSettings>(), async (Key: keyof FSettings) =>
    {
        Copy[Key].default = await GetSetting(Key);

        return Promise.resolve();
    });

    (Copy.Dependencies as FPromptDataCheckbox).choices = (await GetRepos([ "Plugin", "Project", "Tool" ])).map(Repo => Repo.Name);

    return Copy;
};
