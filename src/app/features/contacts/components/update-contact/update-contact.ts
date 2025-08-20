import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Account} from '../../../accounts/models/account.model';
import {Contact} from '../../models/contact.model';
import {ContactsService} from '../../services/contacts.service';
import {AccountsService} from '../../../accounts/services/accounts.service';
import {finalize} from 'rxjs';
import {ClientType} from '../../../incidents/models/enums/client-type.enum';
import {NgClass} from '@angular/common';
import {UpdateContactDto} from '../../models/dtos/update-contact.dto';

@Component({
  selector: 'app-update-contact',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './update-contact.html',
  styleUrl: './update-contact.css'
})
export class UpdateContact {
  @Input() contact!: Contact;
  @Output() contactUpdated = new EventEmitter<void>()
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
    if (this.contact) {
      const [firstName, ...lastNameParts] = this.contact.fullName.split(' ');
      const lastName = lastNameParts.join(' ');
      this.contactForm.patchValue({
        firstName: firstName,
        lastName: lastName,
        email: this.contact.email,
        phone: this.contact.phone,
        parentClientId: this.contact.parentClientId,
        parentClientType: this.contact.parentClientType
      });
    }

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
    const contact: UpdateContactDto = this.contactForm.value;

    this.contactsService.updateContact(this.contact.id, contact)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.showMessage('Contact updated successfully!', 'success');
          this.contactForm.reset();
          this.contactUpdated.emit();
        },
        error: (err) => {
          console.error('Failed to update contact:', err);
          const errorMessage = err.error?.message || 'Failed to update contact. Please try again.';
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
