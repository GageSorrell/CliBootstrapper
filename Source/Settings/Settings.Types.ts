export type FSettings =
{
    AwsAccessKey: string;
    AwsSecret: string;
    Dependencies: Array<string>;
    FeatureDescription: string;
    FeatureName: string;
    GitHubToken: string;
    ParentDirectory: string;
    SanctifiPath: string;
    UeInstallPath: string;
};

export type FSettingsSaved = Map<keyof FSettings, boolean>;