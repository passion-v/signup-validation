import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { IThumbnailUtility } from 'src/app/models/thumbnail';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the thumbnail URL', () => {
    const mockThumbnail: IThumbnailUtility = {
      id: 1,
      albumId: 2,
      title: 'Example Title',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      url: 'https://example.com/image.jpg',
    };
    const length = 10;

    service.getThumbnailUrl(length).subscribe((response) => {
      expect(response).toEqual(mockThumbnail);
    });

    const req = httpMock.expectOne(`https://jsonplaceholder.typicode.com/photos/${length}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockThumbnail);
  });

  it('should handle error when getting thumbnail URL', () => {
    const length = 10;

    service.getThumbnailUrl(length).subscribe(
      () => {
        // The error handling should not reach here as an error is expected
        fail('Expected error but got a response');
      },
      (error) => {
        expect(error).toBe('Something went wrong. Please try again later.');
      }
    );

    const req = httpMock.expectOne(`https://jsonplaceholder.typicode.com/photos/${length}`);
    expect(req.request.method).toBe('GET');
    req.error(new ErrorEvent('Network error'));
  });

  it('should add a new user', () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };

    service.addUser(mockUser).subscribe((response) => {
      expect(response).toBeTruthy();
    });

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user: mockUser });
    req.flush({});
  });

  it('should handle error when adding a new user', () => {
    const mockUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
    };

    service.addUser(mockUser).subscribe(
      () => {
        // The error handling should not reach here as an error is expected
        fail('Expected error but got a response');
      },
      (error) => {
        expect(error).toBe('Something went wrong. Please try again later.');
      }
    );

    const req = httpMock.expectOne('https://jsonplaceholder.typicode.com/users');
    expect(req.request.method).toBe('POST');
    req.error(new ErrorEvent('Network error'));
  });
});
