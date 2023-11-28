import { promises as fsPromises, Dirent } from "fs";
import { AddSubmodule, CloneRepoByName, CreateRepo, GitClient, InitAndPushRepo } from "../Git/GitClient";
import { extname, join, dirname } from "path";
import { DoLongTaskAsync, GetEmptyTempDirectory } from "../Utility";
import { GetSetting, GetSettingOrPrompt } from "../Settings";
import { GetSettingImmutable } from "../ImmutableSettings/ImmutableSettings";

export const CreateUnrealProject = async () =>
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

    await DoLongTaskAsync(`Cloning repository into ${await GetSetting("ParentDirectory")}...`, async () =>
    {
        let DirectoryExists: boolean = true;
        try
        {
            await fsPromises.access(TemplateDirectory);
        }
        catch(Error)
        {
            DirectoryExists = false;
        }

        if (DirectoryExists)
        {
            console.log(`\nDirectory ${TemplateDirectory} already exists.  Exiting...`);
            process.exit(1);
        }
        else
        {
            await CloneRepoByName(TemplateGitHubRepoName, ParentDirectory);
        }
    });

    await DoLongTaskAsync("Updating project file names and contents...", async () =>
    {
        await SearchAndReplaceFiles(TemplateDirectory, TemplateGitHubRepoName, FeatureName);
        FeatureProjectDirectory = await RenameClonedDirectory(TemplateDirectory, FeatureName);
    });

    const PluginsPath: string = join(FeatureProjectDirectory, "Plugins")
    await fsPromises.mkdir(PluginsPath);

    const EmptyTempDirectory: string = await GetEmptyTempDirectory();
    await GitClient.cwd(EmptyTempDirectory);

    let ConfigRepoPath: string = "";
    await DoLongTaskAsync("Downloading Sanctifi project configuration files...", async () =>
    {
        ConfigRepoPath = await CloneRepoByName("SanctifiConfigFiles", EmptyTempDirectory);
    });

    await DoLongTaskAsync(`Removing .git directory of ${FeatureName} project...`, async () =>
    {
        await fsPromises.rm(join(FeatureProjectDirectory, ".git"), { recursive: true });
    });

    await DoLongTaskAsync(`Copying config files into ${FeatureName} project...`, async () =>
    {
        /* Files that go in the root of the git repo. */
        const FilesToRoot: Array<string> = [ "gitignore", "gitattributes", "clang-format" ];
        for await (const FileName of FilesToRoot)
        {
            await fsPromises.copyFile(join(ConfigRepoPath, FileName), join(FeatureProjectDirectory, `.${FileName}`));
        }
    });

    await DoLongTaskAsync(`Creating GitHub repo for ${FeatureName}...`, async () =>
    {
        await CreateRepo(FeatureProjectRepoName, `The project for development of the ${FeatureName}.`);
        await InitAndPushRepo(FeatureProjectRepoName, FeatureProjectDirectory);
    });

    for await (const TemplatePluginName of TemplatePluginNames)
    {
        let PluginRepoPath: string = "";
        const PluginIndex: number = TemplatePluginNames.indexOf(TemplatePluginName);
        const PluginName: string = PluginNames[PluginIndex];

        await DoLongTaskAsync(`Cloning plugin ${TemplatePluginName}...`, async () =>
        {
            PluginRepoPath = await CloneRepoByName(TemplatePluginName, EmptyTempDirectory);
            await fsPromises.rm(join(PluginRepoPath, ".git"), { recursive: true });
            await SearchAndReplaceFiles(PluginRepoPath, "MyFeature", FeatureName);

            // ✔️ Clone plugins in temp directory, not Plugins directory
            // ✔️ Remove .git directories of plugins
            // ✔️ Remove .git directories of project
            // ✔️ Search-and-replace names for plugins
            // ✔️ Download SanctifiConfig files and place them in repo for each plugin, project
            // ✔️ Create git repo for each plugin, project and push
            // ✔️ Add plugins as submodules to project
            // ✔️ Download plugin submodules to project
            // Add feature name to github repo that tracks this
            // List VRE and other Marketplace plugins that are used, and all Sanctifi feature plugins and ask which ones should be added
            // Selected plugins should be added as submodules and added to uproject file
            // Open code-workspace file in new window
        });

        await DoLongTaskAsync(`Copying config files into ${PluginName} plugin...`, async () =>
        {
            /* Files that go in the root of the git repo. */
            const FilesToRoot: Array<string> = [ "gitignore", "gitattributes", "clang-format" ];
            for await (const FileName of FilesToRoot)
            {
                await fsPromises.copyFile(join(ConfigRepoPath, FileName), join(PluginRepoPath, `.${FileName}`));
            }
        });

        await DoLongTaskAsync(`Creating new git repo and pushing to GitHub...`, async () =>
        {
            const Descriptor: string = PluginDescriptors[PluginIndex];
            await CreateRepo(PluginName, `The ${Descriptor} of the ${FeatureName} feature.`);
            await InitAndPushRepo(PluginName, PluginRepoPath);
        });

        await DoLongTaskAsync(`Deleting local copy of ${PluginName}...`, async () =>
        {
            await fsPromises.rm(PluginRepoPath, { recursive: true });
        });

        await DoLongTaskAsync(`Adding ${PluginName} as submodule to ${FeatureName} project...`, async () =>
        {
            const Url: string = `https://github.com/GageSorrell/${PluginName}.git`;
            await AddSubmodule(FeatureProjectDirectory, `Plugins\\${PluginName}`, Url);
        });
    }

    const Deps: Array<string> = await GetSettingOrPrompt("Dependencies");
};

const RenameClonedDirectory = async (DirectoryPath: string, NewProjectName: string) =>
{
    const ParentDirectory: string = dirname(DirectoryPath);
    const NewPath: string = join(ParentDirectory, NewProjectName);
    await fsPromises.rename(DirectoryPath, NewPath);

    return NewPath;
};

/**
 * Search-and-replace all filenames in a directory, and search-and-replace all text files in the directory.
 */
const SearchAndReplaceFiles = async (directoryPath: string, foo: string, bar: string): Promise<void> =>
{
    try 
    {
        // Read the contents of the directory
        const dirents: Dirent[] = await fsPromises.readdir(directoryPath, { withFileTypes: true });

        for (const dirent of dirents) 
        {
            const fullPath = join(directoryPath, dirent.name);

            // If it's a directory, recursively call this function
            if (dirent.isDirectory()) 
            {
                await SearchAndReplaceFiles(fullPath, foo, bar);
            } 

            // If the file name contains 'Foo', rename it
            const newFileName = dirent.name.replace(foo, bar);
            const newFullPath = join(directoryPath, newFileName);
            if (dirent.name.includes(foo)) 
            {
                await fsPromises.rename(fullPath, newFullPath);
            }

            if (dirent.isFile())
            {
                // If it's a text file, replace 'Foo' with 'Bar' in its contents
                const FileExtensions: Array<string> = [ ".uproject", ".h", ".cs", ".cpp", ".uplugin", ".hpp", ".md" ];
                if (FileExtensions.includes(extname(dirent.name)))
                {
                    let content = await fsPromises.readFile(newFullPath, 'utf8');
                    content = content.replace(new RegExp(foo, 'g'), bar);
                    content = content.replace(new RegExp(foo.toUpperCase(), 'g'), bar.toUpperCase());
                    await fsPromises.writeFile(newFullPath, content);
                }
            }
        }
    } 
    catch (error) 
    {
        console.error('An error occurred:', error);
    }
};
