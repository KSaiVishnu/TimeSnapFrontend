import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetVerifyOtpComponent } from './reset-verify-otp.component';

describe('ResetVerifyOtpComponent', () => {
  let component: ResetVerifyOtpComponent;
  let fixture: ComponentFixture<ResetVerifyOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetVerifyOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetVerifyOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
