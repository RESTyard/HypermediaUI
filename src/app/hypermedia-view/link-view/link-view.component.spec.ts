import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkViewComponent } from './link-view.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { HypermediaClientService } from '../hypermedia-client.service';

describe('LinkViewComponent', () => {
  let component: LinkViewComponent;
  let fixture: ComponentFixture<LinkViewComponent>;
  let hypermediaClientService: any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LinkViewComponent
      ],
      imports: [],
      providers: [
        provideHypermediaClientServiceMock(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkViewComponent);
    component = fixture.componentInstance;
    hypermediaClientService = TestBed.inject(HypermediaClientService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isSirenLink', () => {
    it('should return true for Siren', () => {
      const link = { relations: [], url: '', type: 'application/vnd.siren+json' };
      expect(component.isSirenLink(link as any)).toBeTrue();
    });

    it('should return true for undefined type', () => {
      const link = { relations: [], url: '', type: undefined };
      expect(component.isSirenLink(link as any)).toBeTrue();
    });

    it('should return true for empty string type (treated as unknown/Siren)', () => {
      const link = { relations: [], url: '', type: '' } as any;
      expect(component.isSirenLink(link)).toBeTrue();
    });

    it('should return false for PDF', () => {
      const link1 = { relations: [], url: '', type: 'application/pdf' };
      expect(component.isSirenLink(link1 as any)).toBeFalse();

      const link2 = { relations: [], url: '', type: 'application/x-pdf' };
      expect(component.isSirenLink(link2 as any)).toBeFalse();
    });

    it('should return false for JSON', () => {
      const link = { relations: [], url: '', type: 'application/json' };
      expect(component.isSirenLink(link as any)).toBeFalse();
    });

    it('should return false for vendor-specific JSON', () => {
      const link = { relations: [], url: '', type: 'application/vnd.something+json' };
      expect(component.isSirenLink(link as any)).toBeFalse();
    });

    it('should return false for image', () => {
      const link = { relations: [], url: '', type: 'image/png' };
      expect(component.isSirenLink(link as any)).toBeFalse();
    });

    it('should return false for text/plain', () => {
      const link = { relations: [], url: '', type: 'text/plain' };
      expect(component.isSirenLink(link as any)).toBeFalse();
    });

    it('should return false for other types (e.g. zip)', () => {
      const link = { relations: [], url: '', type: 'application/zip' };
      expect(component.isSirenLink(link as any)).toBeFalse();
    });
  });

  describe('navigation and download behavior', () => {
    it('should navigate on main link click and not trigger download', () => {
      // Arrange
      const navigateSpy = spyOn(hypermediaClientService, 'Navigate');
      const downloadSpy = spyOn(hypermediaClientService, 'DownloadAsFile');

      const link = { relations: ['self'], url: 'http://example.com/file', type: 'application/pdf' } as any;
      component.links = [link];
      fixture.detectChanges();

      // Act: directly invoke the component method used by the click handler
      component.navigateLink(link);

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith('http://example.com/file', { acceptType: 'application/pdf' });
      expect(downloadSpy).not.toHaveBeenCalled();
    });
  });
});
