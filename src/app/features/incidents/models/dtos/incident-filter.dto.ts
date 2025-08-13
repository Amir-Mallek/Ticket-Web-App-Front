import {Priority} from '../enums/priority.enum';
import {CaseOrigin} from '../enums/case-origin.enum';
import {Status} from '../enums/status.enum';
import {PaginationFilter} from '../../../../shared/models/pagination-filter.model';
import {HttpParams} from '@angular/common/http';

export class IncidentFilter extends PaginationFilter {
  title?: string;
  ticketNumber?: string;
  clientId?: string;
  agentId?: string;
  priority?: Priority;
  origin?: CaseOrigin;
  status?: Status;
  createdBy?: string;
  createdBefore?: Date;
  createdAfter?: Date;

  override to_params(): HttpParams {
    let params = super.to_params();
    if (this.title) {
      params = params.set('title', this.title);
    }
    if (this.ticketNumber) {
      params = params.set('ticketNumber', this.ticketNumber);
    }
    if (this.clientId) {
      params = params.set('clientId', this.clientId);
    }
    if (this.agentId) {
      params = params.set('agentId', this.agentId);
    }
    if (this.priority) {
      params = params.set('priority', this.priority.toString());
    }
    if (this.origin) {
      params = params.set('origin', this.origin.toString());
    }
    if (this.status) {
      params = params.set('status', this.status.toString());
    }
    if (this.createdBy) {
      params = params.set('createdBy', this.createdBy);
    }
    if (this.createdBefore) {
      params = params.set('createdBefore', this.createdBefore.toISOString());
    }
    if (this.createdAfter) {
      params = params.set('createdAfter', this.createdAfter.toISOString());
    }
    return params;
  }
}
