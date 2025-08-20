import { Component } from '@angular/core';
import {Contact} from '../../models/contact.model';
import {ContactFilter} from '../../models/dtos/contact-filter.dto';
import {ContactsService} from '../../services/contacts.service';
import {FormsModule} from '@angular/forms';
import {CreateContact} from '../create-contact/create-contact';
import {UpdateContact} from '../update-contact/update-contact';
import {Account} from '../../../accounts/models/account.model';
import {AccountsService} from '../../../accounts/services/accounts.service';
import {ClientType} from '../../../incidents/models/enums/client-type.enum';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.html',
  imports: [
    FormsModule,
    CreateContact,
    UpdateContact
  ],
  styleUrls: ['./contact-list.css']
})
export class ContactListComponent {
  filterBy: string = '';
  contacts: Contact[] = [];
  accounts: Account[] = [];
  filter: ContactFilter = new ContactFilter();
  loading = false;
  totalContacts = 0;
  currentPage = 1;
  pageSize = 10;

  // Selected contact for operations
  selectedContact: Contact = { id: '', fullName: ''};


  constructor(
    private readonly contactsService: ContactsService,
    private readonly accountsService: AccountsService
  ) {
    // Initialize filter with default pagination
    this.filter.page = this.currentPage;
    this.filter.pageSize = this.pageSize;
  }

  ngOnInit(): void {
    this.loadContacts();
    this.loadAccounts();
  }

  getContact(id: string): string {
    const contact = this.contacts.find(c => c.id === id);
    return contact ? contact.fullName : '-';
  }

  getAccount(id: string): string {
    const account = this.accounts.find(a => a.id === id);
    return account ? account.name : '-';
  }

  loadAccounts(): void {
    this.accountsService.getAccounts().subscribe({
      next: (response) => {
        this.accounts = response || [];
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  loadContacts(): void {
    this.loading = true;
    this.filter.page = this.currentPage;
    this.filter.pageSize = this.pageSize;

    this.contactsService.getContacts(this.filter).subscribe({
      next: (response) => {
        this.contacts = response || [];
        this.totalContacts = response.length || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  clearFilter(): void {
    this.filter = new ContactFilter();
    this.filter.page = 1;
    this.filter.pageSize = this.pageSize;
    this.currentPage = 1;
    this.loadContacts();
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadContacts();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  // Sorting methods
  sort(column: string): void {
    if (this.filter.orderBy === column) {
      this.filter.descending = !this.filter.descending;
    } else {
      this.filter.orderBy = column;
      this.filter.descending = false;
    }
    this.loadContacts();
  }

  getSortIcon(column: string): string {
    if (this.filter.orderBy !== column) {
      return 'bi bi-arrow-down-up';
    }
    return this.filter.descending ? 'bi bi-arrow-down' : 'bi bi-arrow-up';
  }

  // Modal operations
  openAddModal(): void {
    this.selectedContact = { id: '', fullName: ''};
    const modalElement = document.getElementById('addContactModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  openEditModal(contact: Contact): void {
    this.selectedContact = contact ;
    const modalElement = document.getElementById('editContactModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  openDeleteModal(contact: Contact): void {
    this.selectedContact = contact;
    const modalElement = document.getElementById('deleteConfirmModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  closeModal(): void {
    // Bootstrap modals will close automatically or you can use:
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    });
    this.selectedContact = { id: '', fullName: ''};
  }

  // CRUD operations
  onContactAdded(): void {
    this.closeModal();
    this.loadContacts(); // Reload to get updated list
  }

  onContactUpdated(): void {
    this.closeModal();
    this.loadContacts(); // Reload to get updated list
  }

  confirmDelete(): void {
    if (this.selectedContact) {
      this.contactsService.deleteContact(this.selectedContact.id).subscribe({
        next: () => {
          this.closeModal();
          this.loadContacts();
        },
        error: (error) => {
          console.error('Error deleting contact:', error);
        }
      });
    }
  }

  // Utility methods
  get totalPages(): number {
    return this.totalContacts / this.pageSize + (this.totalContacts % this.pageSize > 0 ? 1 : 0);
  }

  get pageNumbers(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  protected readonly Math = Math;
  protected readonly ClientType = ClientType;
}
