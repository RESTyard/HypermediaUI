import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkViewComponent } from './link-view.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { HypermediaClientService } from '../hypermedia-client.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import {HypermediaLink} from "../siren-parser/hypermedia-link";

describe('LinkViewComponent', () => {
  let component: LinkViewComponent;
  let fixture: ComponentFixture<LinkViewComponent>;
  let hypermediaClientService: HypermediaClientService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LinkViewComponent
      ],
      imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, MatDividerModule],
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
      const link = { relations: [], url: '', type: 'application/vnd.siren+json' } as HypermediaLink;
      expect(component.isSirenLink(link)).toBeTrue();
    });

    it('should return true for undefined type', () => {
      const link = { relations: [], url: '', type: undefined } as unknown as HypermediaLink;
      expect(component.isSirenLink(link)).toBeTrue();
    });

    it('should return true for empty string type (treated as unknown/Siren)', () => {
      const link = { relations: [], url: '', type: '' } as HypermediaLink;
      expect(component.isSirenLink(link)).toBeTrue();
    });

    it('should return false for PDF', () => {
      const link1 = { relations: [], url: '', type: 'application/pdf' } as HypermediaLink;
      expect(component.isSirenLink(link1)).toBeFalse();

      const link2 = { relations: [], url: '', type: 'application/x-pdf' } as HypermediaLink;
      expect(component.isSirenLink(link2)).toBeFalse();
    });

    it('should return false for JSON', () => {
      const link = { relations: [], url: '', type: 'application/json' } as HypermediaLink;
      expect(component.isSirenLink(link)).toBeFalse();
    });

    it('should return false for vendor-specific JSON', () => {
      const link = { relations: [], url: '', type: 'application/vnd.something+json' } as HypermediaLink;
      expect(component.isSirenLink(link)).toBeFalse();
    });

    it('should return false for image', () => {
      const link = { relations: [], url: '', type: 'image/png' } as HypermediaLink;
      expect(component.isSirenLink(link)).toBeFalse();
    });

    it('should return false for text/plain', () => {
      const link = { relations: [], url: '', type: 'text/plain' } as HypermediaLink;
      expect(component.isSirenLink(link)).toBeFalse();
    });

    it('should return false for other types (e.g. zip)', () => {
      const link = { relations: [], url: '', type: 'application/zip' } as HypermediaLink;
      expect(component.isSirenLink(link)).toBeFalse();
    });
  });

  describe('navigation and download behavior', () => {
    it('should navigate on main link click and not trigger download', () => {
      // Arrange
      const navigateSpy = spyOn(hypermediaClientService, 'Navigate');
      const downloadSpy = spyOn(hypermediaClientService, 'DownloadAsFile');

      const link = { relations: ['self'], url: 'http://example.com/file', type: 'application/pdf' } as HypermediaLink;
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
