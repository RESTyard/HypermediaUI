import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JsonPreviewComponent } from './json-preview.component';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-raw-view',
  template: '',
  standalone: false
})
class MockRawViewComponent {
  @Input() rawObject: any;
}

describe('JsonPreviewComponent', () => {
  let component: JsonPreviewComponent;
  let fixture: ComponentFixture<JsonPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JsonPreviewComponent, MockRawViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JsonPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should parse JSON blob', async () => {
    const json = { test: 'value' };
    const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
    component.blob = blob;

    // Trigger ngOnChanges manually for the test
    await component.ngOnChanges({
      blob: {
        currentValue: blob,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.jsonObject).toEqual(json);
  });

  it('should handle raw object', async () => {
    const json = { test: 'value' };
    component.blob = json;

    await component.ngOnChanges({
      blob: {
        currentValue: json,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.jsonObject).toEqual(json);
  });

  it('should handle invalid JSON blob', async () => {
    const blob = new Blob(['invalid json'], { type: 'application/json' });
    component.blob = blob;

    await component.ngOnChanges({
      blob: {
        currentValue: blob,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.jsonObject).toEqual({ error: 'Failed to parse JSON content' });
  });
});
