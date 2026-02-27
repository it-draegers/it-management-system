import { notFound, redirect } from "next/navigation";
import { getAsset, updateAsset } from "@/lib/actions/assets";
import { AssetForm } from "@/components/asset-form"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServer } from "@/lib/actions/servers";
import { ServerForm } from "@/components/server-form";

export default async function EditServersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getServer(id);

  if ("error" in result) {
    notFound();
  }

  const { server } = result;

  async function handleSubmit(data: Parameters<typeof updateAsset>[1]) {
    "use server";
    const res = await updateAsset(id, data);
    if ("error" in res) {
      return;
    }
    redirect(`/dashboard/servers/${id}/edit`);
  }

  async function handleCancel() {
    "use server";

    redirect(`/dashboard/servers/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/servers/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to server</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Server</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit {server.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ServerForm
            server={server}
            loading={false}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
