import inquirer from "inquirer";
import { pascalCase } from "change-case";

export const InitializeInquirer = () =>
{
    inquirer.prompt([
        {
            type: "input",
            name: "PackageName",
            message: "What is the name of the feature?",
            validate: (Input: any): true | string =>
            {
                if (typeof Input !== "string")
                {
                    return "Input is not a string.";
                }

                const IsPascalCase: boolean = Input === pascalCase(Input);

                return IsPascalCase
                    ? true
                    : "The package name must be in PascalCase.";
            }
        }
    ]);
};
