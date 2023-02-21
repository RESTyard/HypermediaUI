export class AppSettings {
    SiteSettings: SiteSettings = new SiteSettings();
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

