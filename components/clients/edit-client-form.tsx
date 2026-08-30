"use client";

import { ClientFormWizard } from "@/components/clients/client-form-wizard";

type EditClientFormProps = {
  clientId: number;
};

export function EditClientForm({ clientId }: EditClientFormProps) {
  return <ClientFormWizard mode="edit" clientId={clientId} />;
}
