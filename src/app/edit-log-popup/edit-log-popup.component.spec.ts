import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLogPopupComponent } from './edit-log-popup.component';

describe('EditLogPopupComponent', () => {
  let component: EditLogPopupComponent;
  let fixture: ComponentFixture<EditLogPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditLogPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLogPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
