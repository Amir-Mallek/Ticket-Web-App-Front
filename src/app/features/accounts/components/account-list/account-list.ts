import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Contact} from '../../../contacts/models/contact.model';
import {Account} from '../../models/account.model';
import {ContactsService} from '../../../contacts/services/contacts.service';
import {AccountsService} from '../../services/accounts.service';
import {AccountFilter} from '../../models/dtos/account-filter.dto';
import {CreateAccountComponent} from '../create-account/create-account';
import {UpdateAccountComponent} from '../update-account/update-account';

@Component({
  selector: 'app-account-list',
  imports: [
    FormsModule,
    CreateAccountComponent,
    UpdateAccountComponent
  ],
  templateUrl: './account-list.html',
  styleUrl: './account-list.css'
})
export class AccountList {
  contacts: Contact[] = [];
  accounts: Account[] = [];
  filter: AccountFilter = new AccountFilter();
  loading = false;
  totalAccounts = 0;
  currentPage = 1;
  pageSize = 10;

  // Selected contact for operations
  selectedAccount: Account = { id: '', name: ''};


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

  loadAccounts(): void {
    this.loading = true;
    this.filter.page = this.currentPage;
    this.filter.pageSize = this.pageSize;

    this.accountsService.getAccounts().subscribe({
      next: (response) => {
        this.accounts = response || [];
        this.totalAccounts = response.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.loading = false;
      }
    });
  }

  loadContacts(): void {
    this.contactsService.getContacts().subscribe({
      next: (response) => {
        this.contacts = response || [];
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
    this.loadAccounts();
  }

  clearFilter(): void {
    this.filter = new AccountFilter();
    this.filter.page = 1;
    this.filter.pageSize = this.pageSize;
    this.currentPage = 1;
    this.loadAccounts();
  }

  // Pagination methods
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAccounts();
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
    this.selectedAccount = { id: '', name: ''};
    const modalElement = document.getElementById('addAccountModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  openEditModal(account: Account): void {
    this.selectedAccount = account ;
    const modalElement = document.getElementById('editAccountModal');
    const modal = new (window as any).bootstrap.Modal(modalElement);
    modal.show();
  }

  openDeleteModal(account: Account): void {
    this.selectedAccount = account ;
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
    this.selectedAccount = { id: '', name: ''};
  }

  // CRUD operations
  onAccountAdded(): void {
    this.closeModal();
    this.loadContacts(); // Reload to get updated list
  }

  onAccountUpdated(): void {
    this.closeModal();
    this.loadContacts(); // Reload to get updated list
  }

  confirmDelete(): void {
    if (this.selectedAccount) {
      this.accountsService.deleteAccount(this.selectedAccount.id).subscribe({
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
    return this.totalAccounts / this.pageSize + (this.totalAccounts % this.pageSize > 0 ? 1 : 0);
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
}
