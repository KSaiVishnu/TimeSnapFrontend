import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteTaskPopupComponent } from './delete-task-popup.component';

describe('DeleteTaskPopupComponent', () => {
  let component: DeleteTaskPopupComponent;
  let fixture: ComponentFixture<DeleteTaskPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteTaskPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteTaskPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
