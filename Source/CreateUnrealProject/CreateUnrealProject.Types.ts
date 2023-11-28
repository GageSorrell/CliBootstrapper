// eslint-disable-next-line @typescript-eslint/no-namespace
namespace SanctifiRepo
{
    export type FType = 
        /** The value for the SanctifiOrigin repo. */
        | "Game"

        /** The repo is for a plugin. */
        | "Plugin"

        /** The repo is for an Unreal project in which development of a feature occurs. */
        | "Project"

        /** The repo is for a non-Unreal tool, such as `sanctifi-add-feature`. */
        | "Tool";

    export type FPlugin =
        /** The plugin is for a feature that will be used in the game. */
        | "Feature"

        /** The plugin is for tests. */
        | "Test"

        /** The plugin contains tools for the editor, such as commandlets or editor utilities. */
        | "Tool";

    export const OriginValues =
    [
        /** The repo was created via this tool. */
        "Internal",

        /** The repo exists on GitHub. */
        "GitHub",

        /** The plugin was obtained via the Unreal Marketplace, and is hosted on the S3 bucket. */
        "Marketplace",

        /** The plugin or tool was obtained via some other resource, and is hosted on the S3 bucket. */
        "Other"
    ] as const;

    export type FOrigin = (typeof OriginValues)[number];

    /** The type of the JSON file at the root of the `SanctifiRepos` repo. */
    export type FRepoBase =
    {
        Comment: "Do not modify this file directly; it is managed by `sanctifi-add-feature`.";

        IsTemplate: boolean;

        /** The name of the GitHub repo, or folder in the root of the S3 bucket. */
        Name: string;

        Origin: FOrigin;

        Type: FType;
    };

    export type FGitHubRepo =
    {
        /** We do not want to always use the latest version. */
        Branch: string;
        Commit: string;
        Url: string;
    }

    export type FPluginRepo = FRepoBase &
    {
        Plugin: FPlugin;
    };

    export type FExternalGitHubRepo =
    {
        Comment: "Do not modify this file directly; it is managed by `sanctifi-add-feature`.";
        GitHub: FGitHubRepo;
        IsTemplate: false;
        Name: string;
        Origin: "GitHub";
        Type: Exclude<FType, "Tool">;
    };

    export type FRepo = FRepoBase | FExternalGitHubRepo;
}

export default SanctifiRepo;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SanctifiFeature
{
    type FToolPlugin =
    {
        IsEditor: true;
        IsTest: false;
    };

    type FGamePlugin =
    {
        IsEditor: false;
        IsTest: false;
    };

    type FTestPlugin =
    {
        IsEditor: true;
        IsTest: true;
    };

    export type FPlugin = (FToolPlugin | FGamePlugin | FTestPlugin) &
    {
        Name: string;
    };
}

export type FSanctifiFeature =
{
    /** The plugins that implement this feature. */
    Plugins: Array<SanctifiFeature.FPlugin>;

    /** The name of the GitHub repo for the project that governs the development of this feature. */
    Project: string;
};

type FGitHubResource =
{
    Commit: string;
    Hash: string;
    Name: string;
    Type: "GitHub";
    Url: string;
};

type FS3Resource =
{
    Name: string;
    Type: "S3";
};

export type FExternalResource = FS3Resource | FGitHubResource;
