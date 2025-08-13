import {PaginationFilter} from '../../../../shared/models/pagination-filter.model';
import {HttpParams} from '@angular/common/http';

export class ContactFilter extends PaginationFilter {
  parentClientId?: string;
  fullName?: string;

  override to_params(): HttpParams {
    const params = super.to_params();
    if (this.parentClientId) {
      params.set('parentClientId', this.parentClientId);
    }
    if (this.fullName) {
      params.set('fullName', this.fullName);
    }
    return params;
  }
}
