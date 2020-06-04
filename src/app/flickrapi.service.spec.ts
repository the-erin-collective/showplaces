import { TestBed } from '@angular/core/testing';

import { FlickrAPIService } from './flickrapi.service';

describe('FlickrapiService', () => {
  let service: FlickrAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlickrAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
