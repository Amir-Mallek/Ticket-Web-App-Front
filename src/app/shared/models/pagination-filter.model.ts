import {HttpParams} from '@angular/common/http';

export class PaginationFilter {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  descending?: boolean;

  to_params() : HttpParams {
    let params = new HttpParams();
    if (this.page) {
      params = params.set('page', this.page.toString());
    }
    if (this.pageSize) {
      params = params.set('pageSize', this.pageSize.toString());
    }
    if (this.orderBy) {
      params = params.set('orderBy', this.orderBy);
    }
    if (this.descending !== undefined) {
      params = params.set('descending', this.descending.toString());
    }
    return params;
  }
}
