import { AlwaysValid, FillOmitted, GetEmptyTempDirectory } from "../Utility";
import { PromptUser, TPrompt } from "../Prompt";
import { CloneRepoByName } from "../Git/GitClient";
import { GetSettingImmutable } from "../ImmutableSettings/ImmutableSettings";
import SanctifiRepo from "../CreateUnrealProject/CreateUnrealProject.Types";
import { promises as fsPromises } from "fs";
import { join } from "path";

const BasePrompts: TPrompt<Omit<SanctifiRepo.FRepoBase, "Comment">> =
{
    IsTemplate:
    {
        message: "Is this resource a template used by `sanctifi-add-feature`?",
        type: "confirm",
        validate: AlwaysValid
    },
    Name:
    {
        message: "What is the name of this resource?  This should be the name of the GitHub repo or folder in the S3 bucket.",
        type: "input",
        validate: (Input: unknown) =>
        {
            const IsValidString: boolean = (Input as any).toString() !== undefined;
            if (!IsValidString)
            {
                return "Input is not a valid string.";
            }
            else
            {
                const LegalCharacters: RegExp = new RegExp(/^[A-Za-z0-9_-]+$/);
                if (LegalCharacters.test(Input as string))
                {
                    return true;
                }
                else
                {
                    return "That name has illegal characters.  You must only use letters, numbers, hyphens, or underscores."
                }
            }
        }
    },
    Origin:
    {
        choices: SanctifiRepo.OriginValues,
        message: "Where does this resource live?",
        type: "list",
        validate: AlwaysValid
    },
    Type:
    {
        choices: SanctifiRepo.OriginValues,
        message: "DUMMY PROMPT PLEASE FIX BEFORE PROCEEDING",
        type: "list",
        validate: AlwaysValid
    }
};

const GitHubPrompts: TPrompt<SanctifiRepo.FGitHubRepo> =
{
    Branch:
    {
        default: "master",
        message: "What is the branch from which we will clone the repo?",
        type: "input",
        validate: AlwaysValid
    },
    Commit:
    {
        message: "What is the commit hash from which we will clone the repo?",
        type: "input",
        validate: AlwaysValid
    },
    Url:
    {
        message: "What is the URL of the git repo?",
        type: "input",
        validate: AlwaysValid
    }
} as const;


/** Add a resource to the `SanctifiRepos` JSON file. */
export const AddExistingResource = async () =>
{
    let Resource: SanctifiRepo.FRepo = FillOmitted<SanctifiRepo.FRepo, "Comment">(await PromptUser(BasePrompts) as Omit<SanctifiRepo.FRepoBase, "Comment">, { Comment: "Do not modify this file directly; it is managed by `sanctifi-add-feature`." });

    if (Resource.Origin === "GitHub")
    {
        const GitHubPart: SanctifiRepo.FGitHubRepo = await PromptUser(GitHubPrompts) as SanctifiRepo.FGitHubRepo;
        Resource = { ...Resource, ...GitHubPart };
    }

    const RepoPath: string = await CloneRepoByName(GetSettingImmutable("ReposRepoName"), await GetEmptyTempDirectory());
    const FilePath: string = join(RepoPath, "SanctifiRepos.json");

    const Repos: Array<SanctifiRepo.FRepo> = JSON.parse((await fsPromises.readFile(FilePath)).toString()).Repos as Array<SanctifiRepo.FRepo>;

    console.log(Repos);
};
