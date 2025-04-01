import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskUploadComponent } from './task-upload.component';

describe('TaskUploadComponent', () => {
  let component: TaskUploadComponent;
  let fixture: ComponentFixture<TaskUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
