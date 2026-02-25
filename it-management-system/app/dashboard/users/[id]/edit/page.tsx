import { notFound, redirect } from "next/navigation";
import { getUser, updateUser } from "@/lib/actions/users";
import { UserForm } from "@/components/user-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getUser(id);

  if ("error" in result) {
    notFound();
  }

  const { user } = result;

  async function handleSubmit(data: Parameters<typeof updateUser>[1]) {
    "use server";
    const res = await updateUser(id, data);
    if ("error" in res) {
      // optional: handle error
      return;
    }
    redirect(`/dashboard/users/${id}`);
  }

  async function handleCancel() {
    "use server";
    redirect(`/dashboard/users/${id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/users/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to user</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit User</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Edit {(user as any).firstName} {(user as any).lastName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            user={user as any}
            loading={false}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
