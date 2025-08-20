import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {AgentFilter} from '../models/dtos/agent-filter.dto';
import {Observable} from 'rxjs';
import {Agent} from '../models/agent.model';

@Injectable({
  providedIn: 'root'
})
export class AgentsService {
  private readonly baseUrl = `${environment.apiUrl}/SystemUser`;

  constructor(private readonly http: HttpClient) {}

  getAgents(filter: AgentFilter): Observable<Agent[]> {
    const params = filter.to_params();
    return this.http.get<Agent[]>(this.baseUrl, {params});
  }

  getAgentById(id: string): Observable<Agent> {
    return this.http.get<Agent>(`${this.baseUrl}/${id}`);
  }
}
