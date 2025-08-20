import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ContactsService} from '../../services/contacts.service';
import {CreateContactDto} from '../../models/dtos/create-contact.dto';
import {Account} from '../../../accounts/models/account.model';
import {Contact} from '../../models/contact.model';
import {AccountsService} from '../../../accounts/services/accounts.service';
import {ClientType} from '../../../incidents/models/enums/client-type.enum';
import {finalize} from 'rxjs';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-create-contact',
  imports: [
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './create-contact.html',
  styleUrl: './create-contact.css'
})
export class CreateContact {
  @Output() contactCreated = new EventEmitter<void>()
  contactForm: FormGroup;
  isSubmitting = false;
  availableAccounts: Account[] = [];
  availableContacts: Contact[] = [];
  submitMessage = '';
  submitMessageType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private readonly contactsService: ContactsService,
    private readonly accountsService: AccountsService
  ) {
    this.contactForm = this.fb.group({
      firstName: [
        { value: '', disabled: this.isSubmitting },
        [Validators.required, Validators.minLength(1)]
      ],
      lastName: [
        { value: '', disabled: this.isSubmitting },
        [Validators.required, Validators.minLength(1)]
      ],
      email: [{ value: '', disabled: this.isSubmitting }, [Validators.email]],
      phone: [{ value: '', disabled: this.isSubmitting }],
      parentClientId: [{ value: null, disabled: this.isSubmitting }],
      parentClientType: [{ value: null, disabled: this.isSubmitting }]
    });

  }

  ngOnInit() {
    this.accountsService.getAccounts().subscribe({
      next: (accounts) => (this.availableAccounts = accounts),
      error: (err) => console.error('Failed to load accounts', err)
    });
    this.contactsService.getContacts().subscribe({
      next: (contacts) => (this.availableContacts = contacts),
      error: (err) => console.error('Failed to load contacts', err)
    });
  }

  submitForm() {
    if (this.contactForm.invalid) return;
    this.clearMessages();
    this.isSubmitting = true;
    const contact: CreateContactDto = this.contactForm.value;

    this.contactsService.createContact(contact)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.showMessage('Contact created successfully!', 'success');
          this.contactForm.reset();
          this.contactCreated.emit();
        },
        error: (err) => {
          console.error('Failed to create contact:', err);
          const errorMessage = err.error?.message || 'Failed to create contact. Please try again.';
          this.showMessage(errorMessage, 'error');
        }
      });
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.submitMessage = message;
    this.submitMessageType = type;
  }

  protected clearMessages() {
    this.submitMessage = '';
    this.submitMessageType = '';
  }

  hasFieldError(fieldName: string, errorType: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.touched && field?.hasError(errorType));
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (!field?.touched || !field?.errors) return '';

    if (field.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} is required.`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (field.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} character(s) long.`;
    }

    return 'Invalid input.';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First name',
      lastName: 'Last name',
      email: 'Email',
      phone: 'Phone'
    };
    return displayNames[fieldName] || fieldName;
  }

  protected readonly ClientType = ClientType;
}
