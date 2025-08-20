import {PaginationFilter} from '../../../../shared/models/pagination-filter.model';
import {HttpParams} from '@angular/common/http';

export class AgentFilter extends PaginationFilter {
  fullName?: string;

  override to_params(): HttpParams {
    let params = super.to_params();
    if (this.fullName) {
      params = params.set('fullName', this.fullName);
    }
    return params;
  }
}
