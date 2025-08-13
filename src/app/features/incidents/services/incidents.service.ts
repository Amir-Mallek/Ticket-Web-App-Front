import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {IncidentFilter} from '../models/dtos/incident-filter.dto';
import {Incident} from '../models/incident.model';
import {Observable} from 'rxjs';
import {CreateIncidentDto} from '../models/dtos/create-incident.dto';
import {UpdateIncidentDto} from '../models/dtos/update-incident.dto';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IncidentsService {
  private readonly baseUrl = `${environment.apiUrl}/Incidents`;

  constructor(private readonly http: HttpClient) {}

  getIncidents(filter: IncidentFilter): Observable<Incident[]> {
    const params = filter.to_params();
    return this.http.get<Incident[]>(this.baseUrl, {params});
  }

  getIncidentById(id: string): Observable<Incident> {
    return this.http.get<Incident>(`${this.baseUrl}/${id}`);
  }

  createIncident(incident: CreateIncidentDto): Observable<string> {
    return this.http.post<string>(this.baseUrl, incident);
  }

  updateIncident(id: string, incident: UpdateIncidentDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, incident);
  }

  deleteIncident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
