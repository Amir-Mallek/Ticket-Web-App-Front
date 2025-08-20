import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Incident} from '../../models/incident.model';
import {Account} from '../../../accounts/models/account.model';
import {Contact} from '../../../contacts/models/contact.model';
import {IncidentFilter} from '../../models/dtos/incident-filter.dto';
import {Priority} from '../../models/enums/priority.enum';
import {CaseOrigin} from '../../models/enums/case-origin.enum';
import {Status} from '../../models/enums/status.enum';
import {ClientType} from '../../models/enums/client-type.enum';
import {IncidentsService} from '../../services/incidents.service';
import {AccountsService} from '../../../accounts/services/accounts.service';
import {ContactsService} from '../../../contacts/services/contacts.service';
import {DatePipe, SlicePipe} from '@angular/common';

@Component({
  selector: 'app-incident-list',
  imports: [
    FormsModule,
    SlicePipe,
    DatePipe
  ],
  templateUrl: './incident-list.html',
  styleUrl: './incident-list.css'
})
export class IncidentList {
  @Output() viewIncident = new EventEmitter<Incident>();

  incidents: Incident[] = [];
  accounts: Account[] = [];
  contacts: Contact[] = [];
  filteredClients: Account[] | Contact[] = [];
  isLoading = false;

  // Filter form properties
  filter: IncidentFilter = new IncidentFilter();
  selectedClientType: ClientType = ClientType.Contact;

  // Enum references for template
  Priority = Priority;
  CaseOrigin = CaseOrigin;
  Status = Status;
  ClientType = ClientType;

  // Helper arrays for dropdowns
  priorities = [
    { value: Priority.High, label: 'High' },
    { value: Priority.Normal, label: 'Normal' },
    { value: Priority.Low, label: 'Low' }
  ];

  origins = [
    { value: CaseOrigin.Phone, label: 'Phone' },
    { value: CaseOrigin.Email, label: 'Email' },
    { value: CaseOrigin.Web, label: 'Web' }
  ];

  statuses = [
    { value: Status.InProgress, label: 'In Progress' },
    { value: Status.OnHold, label: 'On Hold' },
    { value: Status.WaitingForDetails, label: 'Waiting for Details' },
    { value: Status.Researching, label: 'Researching' },
    { value: Status.ProblemSolved, label: 'Problem Solved' },
    { value: Status.Cancelled, label: 'Cancelled' }
  ];

  clientTypes = [
    { value: ClientType.Account, label: 'Account' },
    { value: ClientType.Contact, label: 'Contact' }
  ];

  constructor(
    private incidentService: IncidentsService,
    private accountService: AccountsService,
    private contactService: ContactsService
  ) {}

  ngOnInit() {
    this.loadAccounts();
    this.loadContacts();
    this.loadIncidents();
  }

  private loadAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        this.updateFilteredClients();
      },
      error: (error) => console.error('Error loading accounts:', error)
    });
  }

  private loadContacts() {
    this.contactService.getContacts().subscribe({
      next: (contacts: Contact[]) => {
        this.contacts = contacts;
        this.updateFilteredClients();
      },
      error: (error) => console.error('Error loading contacts:', error)
    });
  }

  private loadIncidents() {
    this.isLoading = true;
    console.log('Loading incidents with filter:', this.filter);
    this.incidentService.getIncidents(this.filter).subscribe({
      next: (incidents: Incident[]) => {
        this.incidents = incidents;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading incidents:', error);
        this.isLoading = false;
      }
    });
  }

  onClientTypeChange() {
    // Reset client selection when type changes
    this.filter.clientId = undefined;
    this.updateFilteredClients();
  }

  onClientSelectionChange(event: any) {
    const potentialId = event.target.value;
    if (potentialId === 'undefined' || potentialId === '') {
      this.filter.clientId = undefined;
    } else {
      this.filter.clientId = potentialId;
    }
  }

  onPriorityChange(event: any) {
    const potentialPriority = event.target.value;
    if (potentialPriority === 'undefined' || potentialPriority === '') {
      this.filter.priority = undefined;
    } else {
      this.filter.priority = +potentialPriority;
    }
  }

  onOriginChange(event: any) {
    const potentialOrigin = event.target.value;
    if (potentialOrigin === 'undefined' || potentialOrigin === '') {
      this.filter.origin = undefined;
    } else {
      this.filter.origin = +potentialOrigin;
    }
  }

  onStatusChange(event: any) {
    const potentialStatus = event.target.value;
    if (potentialStatus === 'undefined' || potentialStatus === '') {
      this.filter.status = undefined;
    } else {
      this.filter.status = +potentialStatus;
    }
  }

  private updateFilteredClients() {
    if (!this.selectedClientType) {
      this.filteredClients = [];
      return;
    }

    this.filteredClients = this.selectedClientType === ClientType.Account
      ? this.accounts
      : this.contacts;
  }

  applyFilters() {
    this.loadIncidents();
  }

  clearFilters() {
    this.filter = new IncidentFilter();
    this.selectedClientType = ClientType.Contact;
    this.updateFilteredClients();
    this.loadIncidents();
  }

  onViewIncident(incident: Incident) {
    this.viewIncident.emit(incident);
  }

  getPriorityLabel(priority: Priority): string {
    return this.priorities.find(p => p.value === priority)?.label || '';
  }

  getPriorityBadgeClass(priority: Priority): string {
    switch (priority) {
      case Priority.High: return 'badge bg-danger';
      case Priority.Normal: return 'badge bg-warning';
      case Priority.Low: return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  }

  getStatusLabel(status: Status): string {
    return this.statuses.find(s => s.value === status)?.label || '';
  }

  getStatusBadgeClass(status: Status): string {
    switch (status) {
      case Status.InProgress: return 'badge bg-primary';
      case Status.OnHold: return 'badge bg-warning';
      case Status.WaitingForDetails: return 'badge bg-info';
      case Status.Researching: return 'badge bg-secondary';
      case Status.ProblemSolved: return 'badge bg-success';
      case Status.Cancelled: return 'badge bg-dark';
      default: return 'badge bg-secondary';
    }
  }

  getOriginLabel(origin: CaseOrigin): string {
    return this.origins.find(o => o.value === origin)?.label || '';
  }
}
