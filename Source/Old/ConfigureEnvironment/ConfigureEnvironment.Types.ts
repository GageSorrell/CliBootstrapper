export type FProjectFile =
{
	FileVersion: number;
	EngineAssociation: string;
	Category: string;
	Description: string;
	Modules: Array<FModuleDescriptor>;
	Plugins: Array<FPluginReferenceDescriptor>;
	TargetPlatforms: Array<string>;
	EpicSampleNameHash?: number;
    IsEnterpriseProject?: boolean;
    DisableEnginePluginsByDefault?: boolean;
	AdditionalRootDirectories?: Array<string>;
};

export type FModuleDescriptor =
{
	Name: string;
	Type: EHostType;
	LoadingPhase: ELoadingPhase;
	PlatformAllowList?: Array<string>;
	PlatformDenyList?: Array<string>;
	TargetAllowList?: Array<EBuildTargetType>;
	TargetDenyList?: Array<EBuildTargetType>;
	TargetConfigurationAllowList?: Array<EBuildConfiguration>;
	TargetConfigurationDenyList?: Array<EBuildConfiguration>;
	ProgramAllowList?: Array<string>;
	ProgramDenyList?: Array<string>;
	AdditionalDependencies?: Array<string>;
    bHasExplicitPlatforms?: boolean;
};

export type FPluginReferenceDescriptor =
{
	Name: string;
	Enabled: boolean;
	Optional?: boolean;
	Description?: string;
	MarketplaceURL?: string;
	PlatformAllowList?: Array<string>;
	PlatformDenyList?: Array<string>;
	TargetConfigurationAllowList?: Array<EBuildConfiguration>;
	TargetConfigurationDenyList?: Array<EBuildConfiguration>;
	TargetAllowList?: Array<EBuildTargetType>;
	TargetDenyList?: Array<EBuildTargetType>;
	SupportedTargetPlatforms?: Array<string>;
	HasExplicitPlatforms?: boolean;
	RequestedVersion?: number;
};

type EBuildConfiguration =
    "Unknown" |
    "Debug" |
    "DebugGame" |
    "Development" |
    "Shipping" |
    "Test";

type EBuildTargetType =
	"Unknown" |
	"Game" |
	"Server" |
	"Client" |
	"Editor" |
	"Program";

type EHostType =
    "Runtime" |
    "RuntimeNoCommandlet" |
    "RuntimeAndProgram" |
    "CookedOnly" |
    "UncookedOnly" |
    "Developer" |
    "DeveloperTool" |
    "Editor" |
    "EditorNoCommandlet" |
    "EditorAndProgram" |
    "Program" |
    "ServerOnly" |
    "ClientOnly" |
    "ClientOnlyNoCommandlet" |
    "Max";

type ELoadingPhase =
    "EarliestPossible" |
    "PostConfigInit" |
    "PostSplashScreen" |
    "PreEarlyLoadingScreen" |
    "PreLoadingScreen" |
    "PreDefault" |
    "Default" |
    "PostDefault" |
    "PostEngineInit" |
    "None" |
    "Max";
