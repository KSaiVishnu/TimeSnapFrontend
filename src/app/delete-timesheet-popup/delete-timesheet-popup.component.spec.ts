import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTimesheetPopupComponent } from './delete-timesheet-popup.component';

describe('DeleteTimesheetPopupComponent', () => {
  let component: DeleteTimesheetPopupComponent;
  let fixture: ComponentFixture<DeleteTimesheetPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTimesheetPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteTimesheetPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
