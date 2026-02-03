declare namespace HypermediaUI {
    export interface IAppConfig {
        disableDeveloperControls: boolean;
        configuredEntryPoints: IConfiguredEntryPointsItem[];
        onlyAllowConfiguredEntryPoints: boolean;
        relationIconMapping?: { [key: string]: string };
        httpMethodIconMapping?: { [key: string]: string };
        actionPopupWarningConfigurations?: IActionClassConfiguration[];
    }
    export interface IConfiguredEntryPointsItem {
        alias: string;
        title: string;
        entryPointUri: string;
    }
    export interface IActionClassConfiguration {
        actionClass: string;
        title: string;
        message: string;
        icon: string;
    }
}

