import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewaComponent } from './reviewa.component';

describe('ReviewaComponent', () => {
  let component: ReviewaComponent;
  let fixture: ComponentFixture<ReviewaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
