import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavesUploadComponent } from './leaves-upload.component';

describe('LeavesUploadComponent', () => {
  let component: LeavesUploadComponent;
  let fixture: ComponentFixture<LeavesUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeavesUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeavesUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
