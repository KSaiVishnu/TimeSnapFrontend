import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetSummaryComponent } from './timesheet-summary.component';

describe('TimesheetSummaryComponent', () => {
  let component: TimesheetSummaryComponent;
  let fixture: ComponentFixture<TimesheetSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimesheetSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
