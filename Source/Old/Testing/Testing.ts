import { join } from "path";
import { GetSettingImmutable } from "../ImmutableSettings/ImmutableSettings";
import { GetSettingOrPrompt } from "../Settings";
import { GetGitHubClient } from "../Git/GitClient";
import { DoLongTask, DoLongTaskAsync } from "../Utility";

export const DeleteRepos = async () =>
{
    const FeatureName: string = await GetSettingOrPrompt("FeatureName");
    const PluginSuffixes: Readonly<Array<string>> = [ "Base", "Test", "" ] as const;
    const PluginDescriptors: Readonly<Array<string>> = [ "base plugin", "test plugin", "main plugin" ] as const;
    const TemplatePluginNames: Readonly<Array<string>> = PluginSuffixes.map(Suffix => `SanctifiPlugin${Suffix}`);
    const PluginNames: Readonly<Array<string>> = PluginSuffixes.map(Suffix => `${FeatureName}${Suffix}`);
    const TemplateGitHubRepoName: string = GetSettingImmutable("TemplateProjectGitHubRepoName");
    const ParentDirectory: string = await GetSettingOrPrompt("ParentDirectory");
    const TemplateDirectory: string = join(ParentDirectory, TemplateGitHubRepoName);
    const FeatureProjectRepoName: string = `${FeatureName}Project`;
    let FeatureProjectDirectory: string = "";

    const GitHub = await GetGitHubClient();
    const Username: string = GetSettingImmutable("GitHubUsername");

    for await (const RepoName of [ FeatureProjectRepoName, ...PluginNames ])
    {
        await DoLongTaskAsync(`Deleting repo ${RepoName}...`, async () =>
        {
            await GitHub.request(`DELETE /repos/${Username}/${RepoName}`, {
                headers:
                {
                    'X-GitHub-Api-Version': '2022-11-28'
                },
                owner: Username,
                repo: RepoName
            });
        });
    }
};

const Sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
