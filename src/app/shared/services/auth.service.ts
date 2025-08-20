import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'access_token';

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }
}
