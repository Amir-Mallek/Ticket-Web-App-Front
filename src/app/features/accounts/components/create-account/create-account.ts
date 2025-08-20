import {Component, EventEmitter, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CreateAccountDto } from '../../models/dtos/create-account.dto';
import { finalize } from 'rxjs';
import { NgClass } from '@angular/common';
import {AccountsService} from '../../services/accounts.service';
import {ContactsService} from '../../../contacts/services/contacts.service';
import {Contact} from '../../../contacts/models/contact.model';

@Component({
  selector: 'app-create-account',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './create-account.html',
  styleUrls: ['./create-account.css']
})
export class CreateAccountComponent {
  @Output() accountCreated = new EventEmitter<void>()
  accountForm: FormGroup;
  isSubmitting = false;
  availableContacts: Contact[] = [];
  submitMessage = '';
  submitMessageType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private readonly accountsService: AccountsService,
    private readonly contactsService: ContactsService
  ) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      email: ['', [Validators.email]],
      phone: [''],
      country: [''],
      city: [''],
      street: [''],
      postalCode: [''],
      primaryContactId: [null]
    });
  }

  ngOnInit() {
    this.contactsService.getContacts().subscribe({
      next: (contacts) => (this.availableContacts = contacts),
      error: (err) => console.error('Failed to load contacts', err)
    });
  }

  submitForm() {
    if (this.accountForm.invalid) return;
    this.clearMessages();
    this.isSubmitting = true;

    const account: CreateAccountDto = this.accountForm.value;

    this.accountsService.createAccount(account)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.showMessage('Account created successfully!', 'success');
          this.accountForm.reset();
          this.accountCreated.emit();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Failed to create account. Please try again.';
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
    const field = this.accountForm.get(fieldName);
    return !!(field?.touched && field?.hasError(errorType));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.accountForm.get(fieldName);
    if (!field?.touched || !field?.errors) return '';

    if (field.hasError('required')) return `${fieldName} is required.`;
    if (field.hasError('email')) return 'Please enter a valid email address.';
    if (field.hasError('minlength')) return `${fieldName} is too short.`;
    return 'Invalid input.';
  }
}
