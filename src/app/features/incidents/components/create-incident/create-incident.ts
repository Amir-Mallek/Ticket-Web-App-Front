// create-incident.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientType } from '../../models/enums/client-type.enum';
import { Priority } from '../../models/enums/priority.enum';
import { CaseOrigin } from '../../models/enums/case-origin.enum';
import { Status } from '../../models/enums/status.enum';
import { Contact } from '../../../contacts/models/contact.model';
import { Account } from '../../../accounts/models/account.model';
import { ContactsService } from '../../../contacts/services/contacts.service';
import { AccountsService } from '../../../accounts/services/accounts.service';
import { IncidentsService } from '../../services/incidents.service';
import { CreateIncidentDto } from '../../models/dtos/create-incident.dto';

@Component({
  selector: 'app-create-incident',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './create-incident.html',
  styleUrl: './create-incident.css'
})
export class CreateIncident {
  incidentForm!: FormGroup;
  selectedClientType: ClientType | null = null;
  isLoading = false;
  isLoadingClients = true;

  contacts: Contact[] = [];
  accounts: Account[] = [];

  // Priority options for display
  priorityOptions = [
    { value: Priority.High, label: 'High', icon: 'bi-exclamation-triangle-fill', class: 'text-danger' },
    { value: Priority.Normal, label: 'Normal', icon: 'bi-dash-circle-fill', class: 'text-warning' },
    { value: Priority.Low, label: 'Low', icon: 'bi-check-circle-fill', class: 'text-success' }
  ];

  // Origin options for display
  originOptions = [
    { value: CaseOrigin.Phone, label: 'Phone', icon: 'bi-telephone-fill' },
    { value: CaseOrigin.Web, label: 'Web', icon: 'bi-globe' },
    { value: CaseOrigin.Email, label: 'Email', icon: 'bi-envelope-fill' }
  ];

  // Status options for display
  statusOptions = [
    { value: Status.InProgress, label: 'In Progress', icon: 'bi-play-circle-fill', class: 'text-primary' },
    { value: Status.OnHold, label: 'On Hold', icon: 'bi-pause-circle-fill', class: 'text-warning' },
    { value: Status.WaitingForDetails, label: 'Waiting for Details', icon: 'bi-clock-fill', class: 'text-info' },
    { value: Status.Researching, label: 'Researching', icon: 'bi-search', class: 'text-secondary' },
    { value: Status.ProblemSolved, label: 'Problem Solved', icon: 'bi-check-circle-fill', class: 'text-success' },
    { value: Status.Cancelled, label: 'Cancelled', icon: 'bi-x-circle-fill', class: 'text-danger' }
  ];

  constructor(
    private fb: FormBuilder,
    private readonly incidentsService: IncidentsService,
    private readonly contactsService: ContactsService,
    private readonly accountsService: AccountsService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadClients();
  }

  initializeForm(): void {
    this.incidentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      clientId: [null, Validators.required],
      clientType: [null, Validators.required],
      priority: [Priority.Normal, Validators.required],
      origin: [CaseOrigin.Web, Validators.required],
      status: [Status.WaitingForDetails, Validators.required],
      description: ['', Validators.maxLength(1000)]
    });
  }

  loadClients(): void {
    this.isLoadingClients = true;
    let contactsLoaded = false;
    let accountsLoaded = false;

    const checkLoadingComplete = () => {
      if (contactsLoaded && accountsLoaded) {
        this.isLoadingClients = false;
      }
    };

    this.contactsService.getContacts().subscribe({
      next: (contacts: Contact[]) => {
        this.contacts = contacts;
        contactsLoaded = true;
        checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        contactsLoaded = true;
        checkLoadingComplete();
      }
    });

    this.accountsService.getAccounts().subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        accountsLoaded = true;
        checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        accountsLoaded = true;
        checkLoadingComplete();
      }
    });
  }

  onClientTypeChange(event: any): void {
    this.selectedClientType = +event.target.value;
    this.incidentForm.get('clientType')?.setValue(this.selectedClientType);
    // Reset client selection when type changes
    this.incidentForm.get('clientId')?.setValue(null);
  }

  onStatusChange(event: any): void {
    const status = +event.target.value;
    this.incidentForm.get('status')?.setValue(status);
  }

  onPriorityChange(event: any): void {
    const priority = +event.target.value;
    this.incidentForm.get('priority')?.setValue(priority);
  }

  onOriginChange(event: any): void {
    const origin = +event.target.value;
    this.incidentForm.get('origin')?.setValue(origin);
  }

  submit(): void {
    if (this.incidentForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    const dto: CreateIncidentDto = this.incidentForm.value;

    this.incidentsService.createIncident(dto).subscribe({
      next: (response) => {
        console.log('Incident created successfully:', response);
        this.incidentForm.reset();
        this.initializeForm();
        this.selectedClientType = null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error creating incident:', error);
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.incidentForm.controls).forEach(key => {
      const control = this.incidentForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.incidentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.incidentForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  protected readonly ClientType = ClientType;
  protected readonly Priority = Priority;
  protected readonly CaseOrigin = CaseOrigin;
  protected readonly Status = Status;
}
