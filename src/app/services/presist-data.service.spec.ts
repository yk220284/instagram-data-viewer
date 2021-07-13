import { TestBed } from '@angular/core/testing';

import { PresistDataService } from './presist-data.service';

describe('PresistDataService', () => {
  let service: PresistDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresistDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
