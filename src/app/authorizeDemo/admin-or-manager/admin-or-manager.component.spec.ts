import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOrManagerComponent } from './admin-or-manager.component';

describe('AdminOrManagerComponent', () => {
  let component: AdminOrManagerComponent;
  let fixture: ComponentFixture<AdminOrManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOrManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOrManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
