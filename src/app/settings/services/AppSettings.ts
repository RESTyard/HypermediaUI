import { defaultSearchOptions, SearchOptions } from '../../hypermedia-view/search/entity-search';

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
        if (this.GeneralSettings.showPropertyTreeControls === undefined) {
            this.GeneralSettings.showPropertyTreeControls = true;
        }
        if (this.GeneralSettings.showSearch === undefined) {
            this.GeneralSettings.showSearch = true;
        }
        // options added later keep their default
        this.GeneralSettings.searchOptions = { ...defaultSearchOptions, ...this.GeneralSettings.searchOptions };
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

    showLinkDropdown: boolean = true;

    autoFollowActionLocationOnSuccess: boolean = false;

    useEmbeddingPropertyForActionParameters: boolean = true;

    showHostInformation: boolean = true;

    showPropertyTreeControls: boolean = true;

    showSearch: boolean = true;

    searchOptions: SearchOptions = defaultSearchOptions;

    actionExecutionTimeoutMs: number = 60000;
}

export class SiteSettingsStorageModel {
    GlobalSiteSettings: SiteSettingStorageModel = new SiteSettingStorageModel("Global", []);
    SiteSpecificSettings: SiteSettingStorageModel[] = [];
}

export class SiteSettingStorageModel {
  constructor(public SiteUrl: string = "", public Headers: HeaderSettingStorageModel[]) {
  }
}

export class HeaderSettingStorageModel {
    // Hidden is missing in settings stored by earlier versions
    constructor(public Key: string = "", public Value: string = "", public Hidden?: boolean) {
    }
}
