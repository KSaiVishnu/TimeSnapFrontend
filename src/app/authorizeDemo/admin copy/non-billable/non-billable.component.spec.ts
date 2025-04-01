import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonBillableComponent } from './non-billable.component';

describe('NonBillableComponent', () => {
  let component: NonBillableComponent;
  let fixture: ComponentFixture<NonBillableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NonBillableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonBillableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
