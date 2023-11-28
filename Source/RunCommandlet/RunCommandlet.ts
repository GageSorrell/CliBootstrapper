import { exec, spawn } from "child_process";
import path from "path";
import { GetSetting } from "../Settings";
import { cwd } from "process";

export const RunCommandlet = async () =>
{
    const UnrealPath: string | undefined = await GetSetting("UeInstallPath");
    if (UnrealPath)
    {
        const CmdPath: string = path.join(UnrealPath, "Engine\\Binaries\\Win64\\UnrealEditor-Cmd.exe");
        const Options: Array<string> = `\"${path.join(cwd(), "CommandletProvider\\CommandletProvider.uproject")}\" -run=CreateNewProjectCommandlet -NoShaderCompile -FeatureName=D:\\FeatureName\\FeatureName.uproject`.split(" ");
        // exec(CmdPath, (Error, Stdout, Stderr) =>
        // {
        //     const FilteredErr: string = Stderr.split("\n").filter((Line: string): boolean => Line.includes("Texture")).join("\n");
        //     console.log(Error, Stdout, FilteredErr);
        // });

        const Process = spawn(CmdPath, Options);
        Process.stdout.on("data", (Data: Buffer) =>
        {
            const DataString: string = Data.toString();
            // if (!DataString.includes("Texture"))
            // {
            //     console.log(DataString);
            // }
            // if (DataString.includes("LogCommandletSample"))
            // {
            //     const DisplayPortion: Array<string> = DataString.split("\n");
            //     console.log(DisplayPortion.map((Line: string) => Line.substring(Line.indexOf("Display: ") + "Display: ".length)).join("\n"));
            // }
            console.log(DataString);
        });
    }
};
