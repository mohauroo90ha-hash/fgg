import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=/admin`);
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
