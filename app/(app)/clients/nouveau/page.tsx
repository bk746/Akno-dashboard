import { NewClientForm } from "@/components/clients/new-client-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewClientPage() {
  return (
    <>
      <PageHeader
        title="Nouveau client"
        description="Onboarding en 4 étapes — dossier client complet, comme en agence"
      />
      <NewClientForm />
    </>
  );
}
