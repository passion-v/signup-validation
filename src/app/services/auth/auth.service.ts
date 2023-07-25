import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IThumbnailUtility } from 'src/app/models/thumbnail';
import { IUserUtility } from 'src/app/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'https://jsonplaceholder.typicode.com';

  constructor(private http: HttpClient) { }

  getThumbnailUrl(length: number): Observable<IThumbnailUtility> {
    return this.http.get<IThumbnailUtility>(`${this.api}/photos/${length}`).pipe(
      catchError(this.handleError)
    );
  }

  addUser(user: IUserUtility): Observable<any> {
    return this.http.post(`${this.api}/users`, { user }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError('Something went wrong. Please try again later.');
  }
}
