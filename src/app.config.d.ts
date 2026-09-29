declare namespace HypermediaUI {
    export interface IAppConfig {
        disableDeveloperControls: boolean;
        reduceUiElements: boolean;
        configuredEntryPoints: IConfiguredEntryPointsItem[];
        onlyAllowConfiguredEntryPoints: boolean;
        relationIconMapping?: Record<string, string>;
        httpMethodIconMapping?: Record<string, string>;
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

