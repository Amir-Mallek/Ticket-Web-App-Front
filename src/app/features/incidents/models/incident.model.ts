import {ClientType} from './enums/client-type.enum';
import {Priority} from './enums/priority.enum';
import {CaseOrigin} from './enums/case-origin.enum';
import {Status} from './enums/status.enum';

export interface Incident {
  id: string;
  title: string;
  ticketNumber: string;
  clientId: string;
  clientType: ClientType;
  agentId: string;
  priority: Priority;
  origin: CaseOrigin;
  status: Status;
  description?: string;
  createdBy: string;
  createdOn: Date;
}
