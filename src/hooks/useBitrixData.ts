import { useState, useEffect } from "react";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";

// =======================
// Configurações do Axios
// =======================
const axiosConfig: AxiosRequestConfig = {
  timeout: 30000,
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =======================
// Constantes Fixas
// =======================
const STATUS_TMA_URGENT_LATE = "1635"; // valor real do campo para "Urgent Late"

// =======================
// Tipagens de Dados
// =======================

type Pipeline = {
  id: string;
  name: string;
};

type User = {
  ID: string;
  NAME: string;
  LAST_NAME: string;
};

type UserWithFullName = {
  ID: string;
  fullName: string;
};

export interface Deal {
  ID: string;
  TITLE: string;
  STAGE_ID: string;      
  CATEGORY_ID: string;
  UF_CRM_DATE_TMA?: string;
  UF_CRM_START_TMA?: string;
  UF_CRM_1741896394870?: string;
  ASSIGNED_BY_ID?: string;

  // Campos personalizados com IDs reais (atualizados)
  UF_CRM_PREPAYMENT_INVOICE?: string | boolean; // SDR SCREENING
  UF_CRM_7Z8430?: string | boolean;             // LISTING CLIENTS (SELL)
  UF_CRM_K66TBQ?: string | boolean;             // PROPERTY RENTAL
  UF_CRM_9NSLPJ?: string | boolean;             // NUTRITION

  OPPORTUNITY?: string;      // Valor total do negócio (Bitrix)
}

interface UsersResponse {
  result: User[];
  next?: number;
}

interface DealsResponse {
  result: Deal[];
  next?: number;
}

interface PipelinesResponse {
  result: { ID: string; NAME: string }[];
}

interface DealStage {
  ID: string;       // Exemplo: "C9:PREPAYMENT_INVOICE"
  STATUS_ID: string; // Código do status (ex: "NEW", "UC_L8M753")
  NAME: string;     // Exemplo: "Pré-fatura"
  SORT: number;     // Para ordenar visualmente
  COLOR: string;    // Cor da coluna no Kanban
}

// =======================
// Função Auxiliar
// =======================

// Interpreta flags booleanas do Bitrix ("Y", "1", true)
function isTruthyBitrixFlag(value: unknown): boolean {
  return value === "Y" || value === true || value === "1";
}

// =======================
// Funções de Requisição
// =======================

// Busca os estágios do pipeline (kanban)
async function fetchDealStages(): Promise<DealStage[]> {
  try {
    const response = await axios.post(
      "https://wra-usa.bitrix24.com/rest/4223/7x3xek7nvl1yx3z2/crm.status.list.json",
      { filter: { ENTITY_ID: "DEAL_STAGE" } },
      axiosConfig
    );

    const stages = (response.data.result as DealStage[]).map(stage => ({
      ID: stage.ID,
      STATUS_ID: stage.STATUS_ID,
      NAME: stage.NAME,
      SORT: Number(stage.SORT) || 0,
      COLOR: stage.COLOR || "#000000",
    }));

    return stages.sort((a, b) => a.SORT - b.SORT);
  } catch (error) {
    console.error("Erro ao buscar estágios do pipeline:", error);
    return [];
  }
}

// Busca os pipelines disponíveis
async function fetchPipelines(): Promise<Pipeline[]> {
  try {
    const response = await axios.get<PipelinesResponse>(
      "https://wra-usa.bitrix24.com/rest/4223/s8edu88f18y02fq2/crm.dealcategory.list.json",
      axiosConfig
    );
    return response.data.result.map(p => ({ id: p.ID, name: p.NAME }));
  } catch (error) {
    console.error("Erro ao buscar pipelines:", error);
    return [];
  }
}

// Busca todos os usuários paginados
async function fetchAllUsers(): Promise<User[]> {
  try {
    const allUsers: User[] = [];
    let start = 0;
    while (true) {
      const response = await axios.get<UsersResponse>(
        "https://wra-usa.bitrix24.com/rest/4223/yamgr19n8vn8821g/user.get.json",
        { params: { start }, ...axiosConfig }
      );
      allUsers.push(...response.data.result);
      if (!response.data.next) break;
      start = response.data.next!;
      await delay(500);
    }
    return allUsers;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

// Busca negócios filtrados pelo pipeline com os campos necessários
async function fetchDealsByPipeline(pipelineId: string): Promise<Deal[]> {
  try {
    const allDeals: Deal[] = [];
    let start = 0;
    while (true) {
      const response = await axios.post<DealsResponse>(
        "https://wra-usa.bitrix24.com/rest/4223/02e3hbi070c4pzcm/crm.deal.list.json",
        {
          filter: { CATEGORY_ID: pipelineId },
          select: [
            "ID",
            "TITLE",
            "STAGE_ID",
            "CATEGORY_ID",
            "UF_CRM_DATE_TMA",
            "UF_CRM_START_TMA",
            "UF_CRM_1741896394870",
            "ASSIGNED_BY_ID",
            "UF_CRM_PREPAYMENT_INVOICE",
            "UF_CRM_7Z8430",
            "UF_CRM_K66TBQ",
            "UF_CRM_9NSLPJ",
            "OPPORTUNITY"
              ],
          start,
        },
        axiosConfig
      );
      allDeals.push(...response.data.result);
      if (!response.data.next) break;
      start = response.data.next!;
      await delay(500);
    }
    return allDeals;
  } catch (error) {
    console.error(`Erro ao buscar negócios para pipeline ${pipelineId}:`, error);
    return [];
  }
}

// =======================
// Hook Principal: useBitrixData
// =======================
// ... (mantive tudo igual até aqui)

export function useBitrixData(userId?: string, pipelineId: string = "9") {
  // Estados para dados principais
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineUsersMap, setPipelineUsersMap] = useState<Record<string, UserWithFullName[]>>({});
  const [pipelineDealsMap, setPipelineDealsMap] = useState<Record<string, Deal[]>>({});
  const [dealStages, setDealStages] = useState<DealStage[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para contadores
  const [total, setTotal] = useState(0);
  const [urgentLateCount, setUrgentLateCount] = useState(0);
  const [startTMACount, setStartTMACount] = useState(0);
  const [sdrScreeningCount, setSdrScreeningCount] = useState(0);
  const [listingClientsCount, setListingClientsCount] = useState(0);
  const [propertyRentalCount, setPropertyRentalCount] = useState(0);
  const [nutritionCount, setNutritionCount] = useState(0);

  // Função para atualizar os contadores
  // eslint-disable-next-line react-hooks/exhaustive-deps
  function updateCount(deals: Deal[]) {
    const filteredDeals = deals.filter(deal => !userId || deal.ASSIGNED_BY_ID === userId);

    console.log("Valores do campo UF_CRM_1741896394870:", filteredDeals.map(d => d.UF_CRM_1741896394870));
    console.log("Valores de SDR_SCREENING:", filteredDeals.map(d => d.UF_CRM_PREPAYMENT_INVOICE));
    console.log("Valores de LISTING_CLIENTS:", filteredDeals.map(d => d.UF_CRM_7Z8430));
    console.log("Valores de PROPERTY_RENTAL:", filteredDeals.map(d => d.UF_CRM_K66TBQ));
    console.log("Valores de NUTRITION:", filteredDeals.map(d => d.UF_CRM_9NSLPJ));

    setTotal(filteredDeals.length);
    setUrgentLateCount(
      filteredDeals.filter(d => d.UF_CRM_1741896394870 === STATUS_TMA_URGENT_LATE).length
    );
    setStartTMACount(filteredDeals.filter(d => !!d.UF_CRM_START_TMA).length);

    setSdrScreeningCount(filteredDeals.filter(d => isTruthyBitrixFlag(d.UF_CRM_PREPAYMENT_INVOICE)).length);
    setListingClientsCount(filteredDeals.filter(d => isTruthyBitrixFlag(d.UF_CRM_7Z8430)).length);
    setPropertyRentalCount(filteredDeals.filter(d => isTruthyBitrixFlag(d.UF_CRM_K66TBQ)).length);
    setNutritionCount(filteredDeals.filter(d => isTruthyBitrixFlag(d.UF_CRM_9NSLPJ)).length);
  }

  // Efeito principal que carrega dados do pipeline, usuários e estágios
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const pipelinesData = await fetchPipelines();
      const allUsers = await fetchAllUsers();
      const stages = await fetchDealStages();
      setDealStages(stages);

      const usersMapByPipeline: Record<string, UserWithFullName[]> = {};
      const dealsMapByPipeline: Record<string, Deal[]> = {};

      const targetPipeline = pipelinesData.find(p => p.id === pipelineId);

      if (targetPipeline) {
        const deals = await fetchDealsByPipeline(targetPipeline.id);
        dealsMapByPipeline[targetPipeline.id] = deals;

        const assignedUserIds = new Set(
          deals.map(deal => deal.ASSIGNED_BY_ID).filter((id): id is string => !!id)
        );

        const usersForPipeline = allUsers
          .filter(user => assignedUserIds.has(user.ID))
          .map(user => ({ ID: user.ID, fullName: `${user.NAME} ${user.LAST_NAME}` }));

        usersMapByPipeline[targetPipeline.id] = usersForPipeline;

        setPipelines([targetPipeline]);
      } else {
        setPipelines([]);
      }

      setPipelineUsersMap(usersMapByPipeline);
      setPipelineDealsMap(dealsMapByPipeline);
      setLoading(false);
    }

    loadData();
  }, [pipelineId]);

  // Efeito para atualizar contadores sempre que os negócios, userId ou pipelineId mudam
  useEffect(() => {
    if (!pipelineDealsMap[pipelineId]) return;

    updateCount(pipelineDealsMap[pipelineId]);
  }, [pipelineDealsMap, userId, pipelineId, updateCount]);

  // Retorna também a função updateCount caso queira usar externamente (opcional)
  return {
    pipelines,
    pipelineUsersMap,
    pipelineDealsMap,
    dealStages,
    total,
    urgentLateCount,
    startTMACount,
    loading,
    sdrScreeningCount,
    listingClientsCount,
    propertyRentalCount,
    nutritionCount,
    updateCount,
  };
}

