export class AppSettingsStorageModel {
    GeneralSettings: GeneralSettingsStorageModel = new GeneralSettingsStorageModel();
    SiteSettings: SiteSettingsStorageModel = new SiteSettingsStorageModel();

    public constructor(init?: Partial<AppSettingsStorageModel>) {
        Object.assign(this, init);
        this.EnsureDefaults();
    }

    public EnsureDefaults() {
        if (!this.GeneralSettings.actionExecutionTimeoutMs) {
            this.GeneralSettings.actionExecutionTimeoutMs = 60000;
        }
    }
}

export class GeneralSettingsStorageModel {
    showRawTab: boolean = true;

    showClasses: boolean = false;

    showEmptyEntities: boolean = false;

    showEmptyProperties: boolean = false;

    showNullProperties: boolean = true;

    showEmptyLinks: boolean = false;

    showEmptyActions: boolean = false;

    useEmbeddingPropertyForActionParameters: boolean = true;

    showHostInformation: boolean = true;

    actionExecutionTimeoutMs: number = 60000;
}

export class SiteSettingsStorageModel {
    GlobalSiteSettings: SiteSettingStorageModel = new SiteSettingStorageModel("Global", [], undefined);
    SiteSpecificSettings: SiteSettingStorageModel[] = [];
}

export class SiteSettingStorageModel {
  constructor(public SiteUrl: string = "", public Headers: HeaderSettingStorageModel[], public AuthConfig: AuthenticationConfigurationStorageModel | undefined) {
  }
}

export class HeaderSettingStorageModel {
    constructor(public Key: string = "", public Value:string ="") {
    }
}

export class AuthenticationConfigurationStorageModel {
    constructor(public authority: string, public client_id: string, public redirect_uri: string, public scope: string) {
    }
}
