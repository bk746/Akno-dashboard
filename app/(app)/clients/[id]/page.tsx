import { EditClientForm } from "@/components/clients/edit-client-form";
import { PageHeader } from "@/components/ui/page-header";

type EditClientPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params;
  const clientId = Number(id);

  return (
    <>
      <PageHeader
        title="Modifier le client"
        description="Dossier client complet — contact, organisation, localisation et contrat"
      />
      <EditClientForm clientId={clientId} />
    </>
  );
}
