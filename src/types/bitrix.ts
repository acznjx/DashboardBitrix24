export interface UserWithFullName {
  ID: string;
  fullName: string;

  // Campos opcionais para montar o nome completo, conforme seu código
  NAME?: string;
  LAST_NAME?: string;
}

export interface Deal {
  ID: string;
  CATEGORY_ID: string;

  ASSIGNED_BY_ID?: string;
  STAGE_ID?: string;
  OPPORTUNITY?: string;

  // Campos personalizados do Bitrix, usando nomes originais dos campos UF_CRM
  UF_CRM_START_TMA?: string;

  UF_CRM_PREPAYMENT_INVOICE?: string | boolean;
  UF_CRM_7Z8430?: string | boolean;
  UF_CRM_K66TBQ?: string | boolean;
  UF_CRM_9NSLPJ?: string | boolean;
}
