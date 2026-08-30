import { Plus } from "lucide-react";
import { ClientsList } from "@/components/clients/clients-list";
import { PageHeader } from "@/components/ui/page-header";
import { NeuLinkButton } from "@/components/ui/neu-form";

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        title="Mes clients"
        description="Vue claire de votre portefeuille — contact, CA et statut en un coup d'œil"
        action={
          <NeuLinkButton href="/clients/nouveau" variant="primary" className="gap-2">
            <Plus size={18} />
            Ajouter un client
          </NeuLinkButton>
        }
      />
      <ClientsList />
    </>
  );
}
