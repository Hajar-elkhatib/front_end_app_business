import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { HumChat } from './hum-chat';

describe('HumChat', () => {
  let service: HumChat;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(HumChat);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
