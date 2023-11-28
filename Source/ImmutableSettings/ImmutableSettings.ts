import { FImmutableSettings } from "./ImmutableSettings.Types";

const ImmutableSettings: FImmutableSettings =
{
    GitHubUsername: "GageSorrell",
    ReposRepoName: "SanctifiRepos",
    S3Bucket: "sanctifi-resources",
    TemplateProjectGitHubRepoName: "SanctifiFeatureTempl"
} as const;

export const GetSettingImmutable = <TKey extends keyof FImmutableSettings>(ImmutableSetting: TKey): FImmutableSettings[TKey] =>
{
    return ImmutableSettings[ImmutableSetting];
};
