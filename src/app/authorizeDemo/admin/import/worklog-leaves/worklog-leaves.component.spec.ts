import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorklogLeavesComponent } from './worklog-leaves.component';

describe('WorklogLeavesComponent', () => {
  let component: WorklogLeavesComponent;
  let fixture: ComponentFixture<WorklogLeavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorklogLeavesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorklogLeavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
