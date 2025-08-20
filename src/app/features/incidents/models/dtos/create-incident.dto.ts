import {ClientType} from '../enums/client-type.enum';
import {Priority} from '../enums/priority.enum';
import {CaseOrigin} from '../enums/case-origin.enum';
import {Status} from '../enums/status.enum';

export interface CreateIncidentDto {
  title: string;
  clientId: number;
  clientType: ClientType;
  priority: Priority;
  origin: CaseOrigin;
  status: Status;
  description?: string;
}
