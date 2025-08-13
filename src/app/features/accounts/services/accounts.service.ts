import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {AccountFilter} from '../models/dtos/account-filter.dto';
import {Observable} from 'rxjs';
import {Account} from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private readonly baseUrl = `${environment.apiUrl}/Accounts`;

  constructor(private http: HttpClient) {}

  getAccounts(filter: AccountFilter): Observable<Account[]> {
    const params = filter.to_params();
    return this.http.get<Account[]>(this.baseUrl, {params});
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${id}`);
  }

  createAccount(account: Account): Observable<string> {
    return this.http.post<string>(this.baseUrl, account);
  }

  updateAccount(id: string, account: Account): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, account);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
