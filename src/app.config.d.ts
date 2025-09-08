declare namespace HypermediaUI {
    export interface IAppConfig {
        disableDeveloperControls: boolean;
        configuredEntryPoints: IConfiguredEntryPointsItem[];
        onlyAllowConfiguredEntryPoints: boolean;
    }
    export interface IConfiguredEntryPointsItem {
        alias: string;
        title: string;
        entryPointUri: string;
    }
}

