import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterlessActionViewComponent } from './parameterless-action-view.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatMenu } from '@angular/material/menu';
import { MatExpansionPanel, MatExpansionPanelDescription } from '@angular/material/expansion';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';

describe('ParameterlessActionViewComponent', () => {
  let component: ParameterlessActionViewComponent;
  let fixture: ComponentFixture<ParameterlessActionViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParameterlessActionViewComponent
      ],
      imports: [
        MatCard,
        MatIcon,
        MatMenu,
        MatExpansionPanel,
        MatExpansionPanelDescription,
      ],
      providers: [
        provideHypermediaClientServiceMock(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterlessActionViewComponent);
    component = fixture.componentInstance;
    component.action = new HypermediaAction();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
