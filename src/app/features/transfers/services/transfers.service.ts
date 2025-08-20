import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {TransferRequest} from '../models/transfer-request.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransfersService {
  private readonly baseUrl = `${environment.apiUrl}/Queue`;

  constructor(private readonly http: HttpClient) {}

  getTransferRequests(agentId: string): Observable<TransferRequest[]> {
    return this.http.get<TransferRequest[]>(`${this.baseUrl}/${agentId}`)
  }

  requestTransfer(incidentId: string, agentId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/transfer/${incidentId}`, {agentId});
  }

  acceptTransfer(transferId: string, agentId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/accept/${transferId}`, {agentId});
  }

  rejectTransfer(transferId: string, agentId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reject/${transferId}`, {agentId});
  }
}
