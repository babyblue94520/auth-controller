import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAuthDialogComponent } from './role-auth-dialog.component';

describe('RoleAuthDialogComponent', () => {
  let component: RoleAuthDialogComponent;
  let fixture: ComponentFixture<RoleAuthDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleAuthDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleAuthDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
