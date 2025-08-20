import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AccountList} from './features/accounts/components/account-list/account-list';
import {CreateIncident} from './features/incidents/components/create-incident/create-incident';
import {IncidentDetails} from './features/incidents/components/incident-details/incident-details';
import {Incident} from './features/incidents/models/incident.model';
import {IncidentList} from './features/incidents/components/incident-list/incident-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IncidentDetails, IncidentList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ticket-web-app-front');
  test_incident: Incident = {
    agentId: '123',
    createdBy: '123',
    ticketNumber: 'CASE-12345',
    id: '1',
    title: 'Test Incident',
    description: 'This is a test incident for demonstration purposes.',
    priority: 1,
    status: 1,
    origin: 2,
    createdOn: new Date(),
    clientType: 2,
    clientId: '12345'
  }
}
