'use client';

import React, { useState, useEffect } from "react";
import CardInfo from "../components/CardInfo";
import LeadsBarChart from "../components/graphs/LeadsBarChart";
import StatusPieChart from "../components/graphs/PieChart";
import { useBitrixData } from "../hooks/useBitrixData";
import { Deal } from "../types/bitrix";
import TopBar from '../components/TopBar';

const VALID_UPDATE_STATUSES = ["2203"]; // Status que contam como Update

export default function Dashboard() {
  const [filters, setFilters] = useState({ userId: "", pipelineId: "9" });

  const {
    total,
    urgentLateCount,
    loading,
    pipelineDealsMap,
    pipelineUsersMap,
  } = useBitrixData(filters.userId, filters.pipelineId);

  const [statusTMAUpdateCount, setStatusTMAUpdateCount] = useState(0);

  const [counts, setCounts] = useState({
    sdr: 0,
    waiting: 0,
    cold: 0,
    hot: 0,
    pending: 0,
    rental: 0,
    listing: 0,
    commercial: 0,
    nutrition: 0,
    closedTotal: 0,
    pendingTotal: 0,
  });

  useEffect(() => {
    const deals: Deal[] = pipelineDealsMap[filters.pipelineId] || [];
    if (deals.length === 0) return;

    const filtered = deals.filter(d => !filters.userId || d.ASSIGNED_BY_ID === filters.userId);

    const stages = {
      sdr: ["C9:PREPAYMENT_INVOICE", "C9:NEW"],
      waiting: "C9:PREPARATION",
      cold: "C9:UC_W2GD5L",
      hot: "C9:EXECUTING",
      pending: "C9:UC_Q6HF3S",
      rental: "C9:UC_K66TBQ",
      listing: "C9:UC_7Z843O",
      commercial: "C9:UC_E2VS4U",
      nutrition: "C9:UC_9NSLPJ",
      closed: "C9:WON"
    };

    const countStage = (id: string | string[]) =>
      filtered.filter(d => Array.isArray(id) ? id.includes(d.STAGE_ID ?? "") : d.STAGE_ID === id).length;

    const sumOpportunity = (ids: string[]) =>
      filtered
        .filter(d => ids.includes(d.STAGE_ID ?? ""))
        .reduce((sum, d) => sum + (parseFloat(d.OPPORTUNITY || "0") || 0), 0);

    setCounts({
      sdr: countStage(stages.sdr),
      waiting: countStage(stages.waiting),
      cold: countStage(stages.cold),
      hot: countStage(stages.hot),
      pending: countStage(stages.pending),
      rental: countStage(stages.rental),
      listing: countStage(stages.listing),
      commercial: countStage(stages.commercial),
      nutrition: countStage(stages.nutrition),
      closedTotal: sumOpportunity([stages.closed]),
      pendingTotal: sumOpportunity([stages.cold, stages.hot, stages.listing]),
    });

    // Contar só os deals com status de Update válidos (excluindo Urgent Late)
    const tmaUpdateCount = filtered.filter(d => {
      const status = d.UF_CRM_1741896394870;
      return status && VALID_UPDATE_STATUSES.includes(status);
    }).length;

    setStatusTMAUpdateCount(tmaUpdateCount);

  }, [pipelineDealsMap, filters]);

  const handleFilterChange = (userId: string, pipelineId: string) => {
    setFilters({ userId, pipelineId });
  };

  const barChartData = [
    { name: "Initial Stage", value: loading ? 0 : counts.sdr },
    { name: "Waiting for Realtor", value: loading ? 0 : counts.waiting },
    { name: "Cold Clients", value: loading ? 0 : counts.cold },
    { name: "Hot Clients", value: loading ? 0 : counts.hot },
    { name: "Pending Sales", value: loading ? 0 : counts.pending },
    { name: "Property Rental", value: loading ? 0 : counts.rental },
    { name: "Listing Clients", value: loading ? 0 : counts.listing },
    { name: "Commercial Business", value: loading ? 0 : counts.commercial },
    { name: "Nutrition", value: loading ? 0 : counts.nutrition },
  ];

  return (
    <>
      <TopBar 
        onClear={() => setFilters({ userId: '', pipelineId: '9' })} 
        onFilterChange={handleFilterChange} 
      />

      <div style={{ padding: "1.5rem", paddingTop: "220px", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* CARDS MONETÁRIOS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <CardInfo title="Buy" value="R$ 0" bgColor="#4b8aa0" />
          <CardInfo 
            title="Pending" 
            value={loading ? "Loading..." : `R$ ${counts.pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`} 
            bgColor="#35647b" 
          />
          <CardInfo title="Sell" value="0 $Dolar" bgColor="#fbbf24" />
          <CardInfo title="Rental" value="$Dolar" bgColor="#fbbf24" />
          <CardInfo title="Business" value="$Dolar" bgColor="#fbbf24" />
          <CardInfo 
            title="Closing - Sold" 
            value={loading ? "Loading..." : `R$ ${counts.closedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
            bgColor="#4caf50" 
          />
        </div>

        {/* CARDS DE CATEGORIA DE ETAPAS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
          <CardInfo 
            title="Initial Stage" 
            value={loading ? "Loading..." : counts.sdr} 
            bgColor="#5dbb6a"
            kanbanHint="Kanban: Incoming Leads, SDR Screening"
          />
          <CardInfo 
            title="Buy" 
            value={loading ? "Loading..." : (counts.cold + counts.hot + counts.pending)} 
            bgColor="#3b82f6"
            kanbanHint="Kanban: Cold Clients, Hot Clients, Pending Sales"
          />
          <CardInfo 
            title="Pendency" 
            value={loading ? "Loading..." : counts.waiting} 
            bgColor="#b91c1c"
            kanbanHint="Kanban: Waiting for Realtor"
          />
          <CardInfo 
            title="Listing Clients (Sell)" 
            value={loading ? "Loading..." : counts.listing} 
            bgColor="#3b82f6"
            kanbanHint="Kanban: Listing Clients"
          />
          <CardInfo 
            title="Property Rental" 
            value={loading ? "Loading..." : counts.rental} 
            bgColor="#3b82f6"
            kanbanHint="Kanban: Property Rental"
          />
          <CardInfo 
            title="Business" 
            value={loading ? "Loading..." : counts.commercial} 
            bgColor="#3b82f6"
            kanbanHint="Kanban: Commercial Business"
          />
          <CardInfo 
            title="Nutrition" 
            value={loading ? "Loading..." : counts.nutrition} 
            bgColor="#d1d5db"
            kanbanHint="Kanban: Nutrition"
          />
        </div>

        {/* STATUS TMA */}
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#072143", marginTop: "2rem" }}>Status TMA</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          <CardInfo title="Total Cards" value={loading ? "Loading..." : total} bgColor="#929292" />
          <CardInfo title="Status TMA (Update)" value={loading ? "Loading..." : statusTMAUpdateCount} bgColor="#a3a3a3" />
          <CardInfo title='Status TMA (Urgent "Late")' value={loading ? "Loading..." : urgentLateCount} bgColor="#b91c1c" />
        </div>

        {/* GRÁFICOS */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginTop: "2rem" }}>
          <section style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#072143" }}>Cards per Category</h2>
            <LeadsBarChart data={barChartData} />
          </section>

          <section style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "1rem", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem", color: "#072143" }}>Total Cards per User</h2>
            <StatusPieChart
              userId={filters.userId}
              pipelineId={filters.pipelineId}
              users={pipelineUsersMap[filters.pipelineId] || []}
              deals={pipelineDealsMap[filters.pipelineId] || []}
              loading={loading}
            />
          </section>
        </div>
      </div>
    </>
  );
}
