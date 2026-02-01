declare namespace HypermediaUI {
    export interface IAppConfig {
        disableDeveloperControls: boolean;
        configuredEntryPoints: IConfiguredEntryPointsItem[];
        onlyAllowConfiguredEntryPoints: boolean;
        relationIconMapping?: { [key: string]: string };
        httpMethodIconMapping?: { [key: string]: string };
    }
    export interface IConfiguredEntryPointsItem {
        alias: string;
        title: string;
        entryPointUri: string;
    }
}

