import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessedPostTableComponent } from './processed-post-table.component';

describe('ProcessedPostTableComponent', () => {
  let component: ProcessedPostTableComponent;
  let fixture: ComponentFixture<ProcessedPostTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProcessedPostTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessedPostTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
