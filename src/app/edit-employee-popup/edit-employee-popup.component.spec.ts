import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEmployeePopupComponent } from './edit-employee-popup.component';

describe('EditEmployeePopupComponent', () => {
  let component: EditEmployeePopupComponent;
  let fixture: ComponentFixture<EditEmployeePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEmployeePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEmployeePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
