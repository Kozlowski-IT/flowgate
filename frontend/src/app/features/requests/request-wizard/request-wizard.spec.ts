import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestWizard } from './request-wizard';

describe('RequestWizard', () => {
  let component: RequestWizard;
  let fixture: ComponentFixture<RequestWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestWizard],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
