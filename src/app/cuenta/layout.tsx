import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AccountNav } from "@/components/cuenta/AccountNav";

export default async function CuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/cuenta");

  return (
    <div className="container mx-auto px-6 lg:px-12 py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        <aside className="lg:w-64 shrink-0">
          <AccountNav />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
