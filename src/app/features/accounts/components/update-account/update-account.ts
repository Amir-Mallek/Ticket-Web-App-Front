import {Component, EventEmitter, Input, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CreateAccountDto } from '../../models/dtos/create-account.dto';
import { finalize } from 'rxjs';
import { NgClass } from '@angular/common';
import {AccountsService} from '../../services/accounts.service';
import {ContactsService} from '../../../contacts/services/contacts.service';
import {Contact} from '../../../contacts/models/contact.model';
import {Account} from '../../models/account.model';
import {UpdateAccountDto} from '../../models/dtos/update-account.dto';

@Component({
  selector: 'app-update-account',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './update-account.html',
  styleUrls: ['./update-account.css']
})
export class UpdateAccountComponent {
  @Input() account!: Account;
  @Output() accountUpdated = new EventEmitter<void>()
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
    if (this.account) {
      const addressParts = this.account.address ? this.account.address.split(',') : [];
      this.accountForm.patchValue({
        name: this.account.name,
        email: this.account.email,
        phone: this.account.phone,
        country: addressParts[0] || '',
        city: addressParts[1] || '',
        street: addressParts[2] || '',
        postalCode: addressParts[3] || '',
        primaryContactId: this.account.primaryContactId
      });
    }

    this.contactsService.getContacts().subscribe({
      next: (contacts) => (this.availableContacts = contacts),
      error: (err) => console.error('Failed to load contacts', err)
    });
  }

  submitForm() {
    if (this.accountForm.invalid) return;
    this.clearMessages();
    this.isSubmitting = true;

    const updatedAccount: UpdateAccountDto = this.accountForm.value;

    this.accountsService.updateAccount(this.account.id, updatedAccount)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.showMessage('Account updated successfully!', 'success');
          this.accountForm.reset();
          this.accountUpdated.emit();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Failed to update account. Please try again.';
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
