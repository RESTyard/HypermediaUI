export class AppSettings {
    GeneralSettings: GeneralSettings = new GeneralSettings();
    SiteSettings: SiteSettings = new SiteSettings();

    public constructor(init?: Partial<AppSettings>) {
        Object.assign(this, init);
        this.EnsureDefaults();
    }
    
    public EnsureDefaults() {
        if (!this.GeneralSettings.actionExecutionTimeoutMs) {
            this.GeneralSettings.actionExecutionTimeoutMs = 60000;
        }
    }
}

export class GeneralSettings {
    showRawTab:boolean = true;

    showClasses:boolean = false;
  
    showEmptyEntities:boolean = false;
  
    showEmptyProperties:boolean = false;
  
    showNullProperties:boolean = true;
  
    showEmptyLinks:boolean = false;
  
    showEmptyActions:boolean = false;
  
    useEmbeddingPropertyForActionParameters:boolean = true;

    showHostInformation:boolean = true;

    actionExecutionTimeoutMs:number = 60000;
}

export class SiteSettings {
    GlobalSiteSettings: SiteSetting = new SiteSetting("Global");
    SiteSpecificSettings: SiteSetting[] = [];
}

export class SiteSetting {
   constructor(public SiteUrl:string = "", public Headers: HeaderSetting[] = []){
   }
}

export class HeaderSetting {
    constructor(public Key:string = "", public Value:string ="") {
    }
}

