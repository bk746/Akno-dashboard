"use client";

import { LayoutGrid, Plus, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AddDashboardCardModal } from "@/components/dashboard/add-dashboard-card-modal";
import {
  DashboardDragHint,
  DashboardGrid,
} from "@/components/dashboard/dashboard-grid";
import {
  renderDashboardCard,
  type DashboardData,
} from "@/components/dashboard/dashboard-card-content";
import { DashboardStudio } from "@/components/dashboard/dashboard-studio";
import { PageHeader } from "@/components/ui/page-header";
import { NeuButton } from "@/components/ui/neu-form";
import { NeuCard } from "@/components/ui/neu-card";
import { getActiveMonthlySubscriptionsTotal, loadStoredClients } from "@/lib/clients";
import {
  applyRecommendedDashboardLayout,
  getAvailableCards,
  loadAndNormalizeDashboardLayout,
  recommendedDashboardLayout,
  saveDashboardLayout,
  type DashboardCardId,
} from "@/lib/dashboard";
import {
  buildMonthlyFinance,
  buildRevenueChart,
  getFinanceSummary,
  getRecentTransactions,
  loadStoredTransactions,
  mergeFinanceEntries,
} from "@/lib/finances";
import { getGoalsByPeriod, loadStoredGoals } from "@/lib/goals";
import { loadStoredInvoices } from "@/lib/invoices";
import { loadPlannerData } from "@/lib/planner";
import { loadStoredProspects } from "@/lib/prospects";
import { loadStoredQuotes } from "@/lib/quotes";

type DashboardView = "studio" | "custom";

export default function DashboardOverview() {
  const pathname = usePathname();
  const [view, setView] = useState<DashboardView>("studio");
  const [layout, setLayout] = useState<DashboardCardId[]>([]);
  const [ready, setReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [quotes, setQuotes] = useState<ReturnType<typeof loadStoredQuotes>>([]);
  const [prospects, setProspects] = useState<ReturnType<typeof loadStoredProspects>>([]);
  const [clients, setClients] = useState<ReturnType<typeof loadStoredClients>>([]);
  const [invoices, setInvoices] = useState<ReturnType<typeof loadStoredInvoices>>([]);
  const [storedGoals, setStoredGoals] = useState<ReturnType<typeof loadStoredGoals>>([]);
  const [transactions, setTransactions] = useState<ReturnType<typeof loadStoredTransactions>>([]);
  const [reminders, setReminders] = useState(() => loadPlannerData().reminders);

  useEffect(() => {
    setLayout(loadAndNormalizeDashboardLayout());
    setQuotes(loadStoredQuotes());
    setProspects(loadStoredProspects());
    setClients(loadStoredClients());
    setInvoices(loadStoredInvoices());
    setStoredGoals(loadStoredGoals());
    setTransactions(loadStoredTransactions());
    setReminders(loadPlannerData().reminders);
    setReady(true);
  }, []);

  useEffect(() => {
    function refreshData() {
      setQuotes(loadStoredQuotes());
      setProspects(loadStoredProspects());
      setClients(loadStoredClients());
      setInvoices(loadStoredInvoices());
      setStoredGoals(loadStoredGoals());
      setTransactions(loadStoredTransactions());
      setReminders(loadPlannerData().reminders);
    }

    refreshData();
  }, [pathname]);

  useEffect(() => {
    function refreshAllData() {
      setQuotes(loadStoredQuotes());
      setProspects(loadStoredProspects());
      setClients(loadStoredClients());
      setInvoices(loadStoredInvoices());
      setStoredGoals(loadStoredGoals());
      setTransactions(loadStoredTransactions());
      setReminders(loadPlannerData().reminders);
    }

    window.addEventListener("focus", refreshAllData);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshAllData();
    });

    return () => {
      window.removeEventListener("focus", refreshAllData);
    };
  }, []);

  useEffect(() => {
    if (!ready || view !== "custom") return;
    saveDashboardLayout(layout);
  }, [layout, ready, view]);

  const mergedTransactions = useMemo(
    () => mergeFinanceEntries(transactions, invoices),
    [transactions, invoices],
  );

  const finance = getFinanceSummary(mergedTransactions);
  const monthGoals = getGoalsByPeriod(storedGoals, "month");
  const monthlyFinance = buildMonthlyFinance(mergedTransactions);
  const revenueChart = buildRevenueChart(invoices);
  const recentTransactions = getRecentTransactions(mergedTransactions);
  const activeSubscriptionsMrr = getActiveMonthlySubscriptionsTotal(clients);
  const activeProspects = prospects.filter((p) => p.outcome === "en-cours").length;

  const dashboardData: DashboardData = {
    paidThisMonth: finance.moisRevenus,
    moisDepenses: finance.moisDepenses,
    moisBenefice: finance.moisBenefice,
    activeClients: clients.filter((c) => c.status === "active").length,
    quotesCount: quotes.length,
    activeProspects,
    monthGoals,
    monthlyFinance,
    revenueChart,
    recentTransactions,
    quotes,
    prospects,
  };

  const availableCards = getAvailableCards(layout);

  function addCard(id: DashboardCardId) {
    setLayout((current) => [...current, id]);
  }

  function removeCard(id: DashboardCardId) {
    setLayout((current) => current.filter((cardId) => cardId !== id));
  }

  function applyRecommendedLayout() {
    if (
      layout.length > 0 &&
      !window.confirm(
        "Appliquer la vue recommandée AKNO ? Votre disposition actuelle sera remplacée.",
      )
    ) {
      return;
    }

    setLayout(applyRecommendedDashboardLayout(layout));
  }

  if (view === "studio") {
    return (
      <>
        <DashboardStudio
          transactions={mergedTransactions}
          paidThisMonth={finance.moisRevenus}
          moisDepenses={finance.moisDepenses}
          moisBenefice={finance.moisBenefice}
          activeSubscriptionsMrr={activeSubscriptionsMrr}
          monthGoals={monthGoals}
          quotes={quotes}
          prospects={prospects}
          reminders={reminders}
          onCustomize={() => setView("custom")}
        />

        <AddDashboardCardModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          availableCards={availableCards}
          onAdd={addCard}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Mode personnalisation — glissez vos cartes"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <NeuButton
              variant="secondary"
              className="gap-1.5 px-4 py-2 text-xs"
              onClick={() => setView("studio")}
            >
              Vue principale
            </NeuButton>
            <NeuButton
              variant="secondary"
              className="gap-1.5 px-4 py-2 text-xs"
              onClick={applyRecommendedLayout}
            >
              <Sparkles size={15} />
              Vue AKNO
            </NeuButton>
            <NeuButton
              variant="primary"
              className="gap-1.5 px-4 py-2 text-xs"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={15} />
              Ajouter
            </NeuButton>
          </div>
        }
      />

      {layout.length === 0 ? (
        <NeuCard className="py-20 text-center">
          <LayoutGrid size={32} className="mx-auto text-neu-accent-2" />
          <p className="mt-4 text-sm font-semibold text-neu-text">
            Votre dashboard est vide
          </p>
          <p className="mt-2 text-sm text-neu-muted">
            Ajoutez les cartes KPI et widgets que vous voulez suivre, ou démarrez avec la
            vue AKNO ({recommendedDashboardLayout.length} cartes essentielles).
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <NeuButton variant="primary" className="gap-2" onClick={applyRecommendedLayout}>
              <Sparkles size={16} />
              Vue recommandée AKNO
            </NeuButton>
            <NeuButton variant="secondary" className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              Choisir moi-même
            </NeuButton>
          </div>
        </NeuCard>
      ) : (
        <DashboardGrid
          layout={layout}
          onLayoutChange={setLayout}
          onRemove={removeCard}
          renderCard={(id) => renderDashboardCard(id, dashboardData)}
        />
      )}

      {layout.length > 0 && <DashboardDragHint cardCount={layout.length} />}

      <AddDashboardCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        availableCards={availableCards}
        onAdd={addCard}
      />
    </>
  );
}
