import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLogAdminComponent } from './add-log-admin.component';

describe('AddLogAdminComponent', () => {
  let component: AddLogAdminComponent;
  let fixture: ComponentFixture<AddLogAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLogAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddLogAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
