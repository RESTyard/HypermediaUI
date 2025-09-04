import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterActionComponent } from './parameter-action.component';
import { provideHypermediaClientServiceMock } from 'src/app/test/HypermediaClientServiceMock';
import { MatMenu } from '@angular/material/menu';
import { MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { HypermediaAction } from '../../siren-parser/hypermedia-action';

describe('ParameterActionComponent', () => {
  let component: ParameterActionComponent;
  let fixture: ComponentFixture<ParameterActionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ParameterActionComponent
      ],
      imports: [
        MatMenu,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        MatIcon,
        MatExpansionPanelDescription,
      ],
      providers: [
        provideHypermediaClientServiceMock(),
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParameterActionComponent);
    component = fixture.componentInstance;
    component.action = new HypermediaAction();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
