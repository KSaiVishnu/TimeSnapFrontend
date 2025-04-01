import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillableComponent } from './billable.component';

describe('BillableComponent', () => {
  let component: BillableComponent;
  let fixture: ComponentFixture<BillableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BillableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
