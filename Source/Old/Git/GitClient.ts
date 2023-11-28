import * as GitHub from "@octokit/rest";
import * as ImportSimpleGit from 'simple-git';
import { GetEmptyTempDirectory } from '../Utility';
import { GetSettingImmutable } from '../ImmutableSettings/ImmutableSettings';
import { GetSettingOrPrompt } from '../Settings';
import SanctifiRepos from "../CreateUnrealProject/CreateUnrealProject.Types";
import { SimpleGit } from 'simple-git';
import { join } from 'path';
import { promises as fsPromises } from "fs";

const { simpleGit } = ImportSimpleGit;

export const GitClient: SimpleGit = simpleGit();

let GitHubClient: GitHub.Octokit | undefined;

export const GetGitHubClient = async (): Promise<GitHub.Octokit> =>
{
    if (GitHubClient === undefined)
    {
        GitHubClient = await InitializeGitHubClient();        
    }

    return Promise.resolve(GitHubClient as GitHub.Octokit);
};

let Repos: Array<any> | undefined = undefined;

export const GetAllRepos = async () =>
{
    if (Repos === undefined)
    {
        const Client: GitHub.Octokit = await GetGitHubClient();

        Repos = [ ];
        for await (const Chunk of Client.paginate.iterator(Client.rest.repos.listForAuthenticatedUser, { type: "owner" } ))
        {
            Repos = Repos.concat(Chunk.data);
        }
    }

    return Promise.resolve(Repos);
};

export const GetRepoByName = async (Name: string): Promise<any | undefined> =>
{
    const Repos = await GetAllRepos();
    return Promise.resolve(Repos.find((Repo: any) => Repo.name === Name));
};

const InitializeGitHubClient = async (): Promise<GitHub.Octokit> =>
{
    return GetSettingOrPrompt("GitHubToken").then((Token: string): GitHub.Octokit =>
    {
        return new GitHub.Octokit({ auth: Token });
    });
};

export const CloneRepoByName = async (RepoName: string, Directory: string): Promise<string> =>
{
    const Repo = await GetRepoByName(RepoName);
    await GitClient.cwd(Directory);
    await GitClient.clone(Repo.html_url);

    return Promise.resolve(join(Directory, RepoName));
};

export const CreateRepo = async (RepoName: string, Description: string): Promise<void> =>
{
    await GitHubClient?.repos.createForAuthenticatedUser({
        description: Description,
        name: RepoName,
        private: true
    });
};

export const InitAndPushRepo = async (RepoName: string, Path: string) =>
{
    await GitClient.cwd(Path);
    await GitClient.init();
    await GitClient.add("*");
    await GitClient.commit("Initial commit.");

    const GitHubUsername: string = await GetSettingImmutable("GitHubUsername");
    await GitClient.addRemote("origin", `https://github.com/${GitHubUsername}/${RepoName}.git`);
    await GitClient.push("origin", "master");
};

export const AddSubmodule = async (Path: string, SubmoduleName: string, SubmoduleUrl: string) =>
{
    await GitClient.cwd(Path);
    await GitClient.submoduleAdd(SubmoduleUrl, SubmoduleName);
    await GitClient.commit(`Adds submodule ${SubmoduleName}.`);
    await GitClient.push("origin", "master");
};

export const GetRepos = async (Types?: Array<SanctifiRepos.FType>): Promise<Array<SanctifiRepos.FRepo>> =>
{
    const TempPath: string = await GetEmptyTempDirectory();
    const Path: string = await CloneRepoByName(GetSettingImmutable("ReposRepoName"), TempPath);
    const Repos: Array<SanctifiRepos.FRepo> = JSON.parse((await fsPromises.readFile(join(Path, "SanctifiRepos.json"))).toString()).Repos as Array<SanctifiRepos.FRepo>;

    const OutRepos: Array<SanctifiRepos.FRepo> = Types === undefined
        ? Repos
        : Repos.filter(Repo => Types.includes(Repo.Type));

    await fsPromises.rm(TempPath, { recursive: true });

    return Promise.resolve(OutRepos);
};