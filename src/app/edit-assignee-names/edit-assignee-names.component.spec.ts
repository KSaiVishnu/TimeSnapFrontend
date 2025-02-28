import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssigneeNamesComponent } from './edit-assignee-names.component';

describe('EditAssigneeNamesComponent', () => {
  let component: EditAssigneeNamesComponent;
  let fixture: ComponentFixture<EditAssigneeNamesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssigneeNamesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAssigneeNamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
