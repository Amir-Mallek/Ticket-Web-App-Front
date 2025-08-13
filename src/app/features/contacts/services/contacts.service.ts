import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ContactFilter} from '../models/dtos/contact-filter.dto';
import {Contact} from '../models/contact.model';
import {Observable} from 'rxjs';
import {UpdateContactDto} from '../models/dtos/update-contact.dto';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private readonly baseUrl = `${environment.apiUrl}/Contacts`;

  constructor(private http: HttpClient) {}

  getContacts(filter: ContactFilter): Observable<Contact[]> {
    const params = filter.to_params();
    return this.http.get<Contact[]>(this.baseUrl, {params});
  }

  getContactById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.baseUrl}/${id}`);
  }

  createContact(contact: Contact): Observable<string> {
    return this.http.post<string>(this.baseUrl, contact);
  }

  updateContact(id: string, contact: UpdateContactDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, contact);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
