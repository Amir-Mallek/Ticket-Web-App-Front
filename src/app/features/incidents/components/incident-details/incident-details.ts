import {Component, Input} from '@angular/core';
import {Priority} from '../../models/enums/priority.enum';
import {Status} from '../../models/enums/status.enum';
import {ClientType} from '../../models/enums/client-type.enum';
import {Incident} from '../../models/incident.model';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CaseOrigin} from '../../models/enums/case-origin.enum';
import {IncidentsService} from '../../services/incidents.service';
import {UpdateIncidentDto} from '../../models/dtos/update-incident.dto';
import {SlicePipe} from '@angular/common';
import {ContactsService} from '../../../contacts/services/contacts.service';
import {AccountsService} from '../../../accounts/services/accounts.service';

@Component({
  selector: 'app-incident-details',
  imports: [
    ReactiveFormsModule,
    SlicePipe
  ],
  templateUrl: './incident-details.html',
  styleUrl: './incident-details.css'
})
export class IncidentDetails {
  @Input() incident!: Incident;
  @Input() readonly: boolean = false;

  editForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  originalFormValues: any = {};
  clientName: string = '';

  // Priority options for display
  priorityOptions = [
    {
      value: Priority.High,
      label: 'High',
      icon: 'bi-exclamation-triangle-fill',
      class: 'text-danger',
      bgClass: 'bg-danger-subtle',
      badge: 'badge-danger'
    },
    {
      value: Priority.Normal,
      label: 'Normal',
      icon: 'bi-dash-circle-fill',
      class: 'text-warning',
      bgClass: 'bg-warning-subtle',
      badge: 'badge-warning'
    },
    {
      value: Priority.Low,
      label: 'Low',
      icon: 'bi-check-circle-fill',
      class: 'text-success',
      bgClass: 'bg-success-subtle',
      badge: 'badge-success'
    }
  ];

  // Status options for display
  statusOptions = [
    {
      value: Status.InProgress,
      label: 'In Progress',
      icon: 'bi-play-circle-fill',
      class: 'text-primary',
      bgClass: 'bg-primary-subtle',
      badge: 'badge-primary'
    },
    {
      value: Status.OnHold,
      label: 'On Hold',
      icon: 'bi-pause-circle-fill',
      class: 'text-warning',
      bgClass: 'bg-warning-subtle',
      badge: 'badge-warning'
    },
    {
      value: Status.WaitingForDetails,
      label: 'Waiting for Details',
      icon: 'bi-clock-fill',
      class: 'text-info',
      bgClass: 'bg-info-subtle',
      badge: 'badge-info'
    },
    {
      value: Status.Researching,
      label: 'Researching',
      icon: 'bi-search',
      class: 'text-secondary',
      bgClass: 'bg-secondary-subtle',
      badge: 'badge-secondary'
    },
    {
      value: Status.ProblemSolved,
      label: 'Problem Solved',
      icon: 'bi-check-circle-fill',
      class: 'text-success',
      bgClass: 'bg-success-subtle',
      badge: 'badge-success'
    },
    {
      value: Status.Cancelled,
      label: 'Cancelled',
      icon: 'bi-x-circle-fill',
      class: 'text-danger',
      bgClass: 'bg-danger-subtle',
      badge: 'badge-danger'
    }
  ];

  // Origin display options (read-only)
  originOptions = [
    { value: CaseOrigin.Phone, label: 'Phone', icon: 'bi-telephone-fill', class: 'text-info' },
    { value: CaseOrigin.Web, label: 'Web', icon: 'bi-globe', class: 'text-primary' },
    { value: CaseOrigin.Email, label: 'Email', icon: 'bi-envelope-fill', class: 'text-success' }
  ];

  constructor(
    private fb: FormBuilder,
    private readonly incidentsService: IncidentsService,
    private readonly contactsService: ContactsService,
    private readonly accountsService: AccountsService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    if (this.incident.clientType == ClientType.Contact) {
      this.contactsService.getContactById(this.incident.clientId)
        .subscribe({
          next: contact => {
            this.clientName = contact.fullName;
          },
          error: error => {
            console.error('Error fetching contact:', error);
          }
        });
    } else {
      this.accountsService.getAccountById(this.incident.clientId)
        .subscribe({
          next: account => {
            this.clientName = account.name;
          },
          error: error => {
            console.error('Error fetching account:', error);
          }
        });
    }
  }

  initializeForm(): void {
    this.editForm = this.fb.group({
      priority: [this.incident?.priority, Validators.required],
      status: [this.incident?.status, Validators.required],
      description: [this.incident?.description || '', Validators.maxLength(1000)]
    });

    // Store original values for cancel functionality
    this.originalFormValues = this.editForm.value;
  }

  getPriorityOption(priority: Priority) {
    return this.priorityOptions.find(opt => opt.value === priority)
      ?? {
      value: Priority.Normal,
      label: 'Normal',
      icon: 'bi-dash-circle-fill',
      class: 'text-warning',
      bgClass: 'bg-warning-subtle',
      badge: 'badge-warning'
      };
  }

  getStatusOption(status: Status) {
    return this.statusOptions.find(opt => opt.value === status)
      ?? {
      value: Status.InProgress,
      label: 'In Progress',
      icon: 'bi-play-circle-fill',
      class: 'text-primary',
      bgClass: 'bg-primary-subtle',
      badge: 'badge-primary'
    };
  }

  getOriginOption(origin: CaseOrigin) {
    return this.originOptions.find(opt => opt.value === origin)
      ?? { value: CaseOrigin.Phone, label: 'Phone', icon: 'bi-telephone-fill', class: 'text-info' };
  }

  getClientTypeIcon(clientType: ClientType): string {
    return clientType === ClientType.Contact ? 'bi-person-fill' : 'bi-building';
  }

  getClientTypeLabel(clientType: ClientType): string {
    return clientType === ClientType.Contact ? 'Contact' : 'Account';
  }

  toggleEdit(): void {
    if (this.readonly) return;

    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to original values when canceling
      this.editForm.patchValue(this.originalFormValues);
    }
  }

  saveChanges(): void {
    if (this.editForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.editForm.value;
    const hasChanges = this.hasFormChanges();

    if (!hasChanges) {
      this.isEditing = false;
      return;
    }

    this.isLoading = true;
    const updateDto: UpdateIncidentDto = {};

    // Only include changed fields
    if (formValue.priority !== this.originalFormValues.priority) {
      updateDto.priority = formValue.priority;
    }
    if (formValue.status !== this.originalFormValues.status) {
      updateDto.status = formValue.status;
    }
    if (formValue.description !== this.originalFormValues.description) {
      updateDto.description = formValue.description;
    }

    this.incidentsService.updateIncident(this.incident.id, updateDto).subscribe({
      next: () => {
        this.originalFormValues = this.editForm.value;
        this.isEditing = false;
        this.isLoading = false;
        console.log('Incident updated successfully');
      },
      error: (error) => {
        console.error('Error updating incident:', error);
        this.isLoading = false;
      }
    });
  }

  hasFormChanges(): boolean {
    const currentValues = this.editForm.value;
    return Object.keys(currentValues).some(key =>
      currentValues[key] !== this.originalFormValues[key]
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['maxlength']) return `${fieldName} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  protected readonly Priority = Priority;
  protected readonly Status = Status;
  protected readonly ClientType = ClientType;
}
