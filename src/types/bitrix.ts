export interface Deal {
  ID: string;
  CATEGORY_ID: string;

  ASSIGNED_BY_ID?: string;
  STAGE_ID?: string;
  OPPORTUNITY?: string;

  UF_CRM_START_TMA?: string;
  UF_CRM_PREPAYMENT_INVOICE?: string | boolean;
  UF_CRM_7Z8430?: string | boolean;
  UF_CRM_K66TBQ?: string | boolean;
  UF_CRM_9NSLPJ?: string | boolean;

  UF_CRM_1741896394870?: string;

  TIMESTAMP_X?: string; 
}
