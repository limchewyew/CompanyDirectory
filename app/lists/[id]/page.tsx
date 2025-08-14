import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getList(id: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/lists/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function getCompanies() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/companies`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function ListDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const list = await getList(params.id);
  if (!list) {
    return <div className="p-6">List not found</div>;
  }
  const companies = await getCompanies();
  const companyMap: Record<string, any> = {};
  for (const c of companies) companyMap[String(c.id)] = c;
  const ownerEmail = session?.user?.email ?? null;
  const isOwner = !!(ownerEmail && list.ownerEmail && list.ownerEmail.toLowerCase() === ownerEmail.toLowerCase());

  return (
    <div className="w-11/12 mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{list.name}</h1>
          <p className="text-sm text-gray-500">Owner: {list.ownerEmail} {list.isPublic ? '(Public)' : '(Private)'}</p>
        </div>
        <a href="/lists" className="text-sm text-blue-600 hover:underline">Back to lists</a>
      </div>

      <div className="bg-white border rounded">
        <div className="border-b px-4 py-2 font-semibold">Companies</div>
        <ul className="divide-y">
          {(list.items || []).length === 0 ? (
            <li className="px-4 py-3 text-sm text-gray-500">No companies in this list yet.</li>
          ) : (
            list.items.map((it: any) => {
              const c = companyMap[String(it.companyId)];
              return (
                <li key={it.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{c?.name || `Company #${it.companyId}`}</div>
                    {c?.industry && <div className="text-xs text-gray-500">{c.industry}</div>}
                  </div>
                  {isOwner && (
                    <form action={`/api/lists/${params.id}/items/${it.companyId}`} method="post" onSubmit={async (e) => {
                      e.preventDefault();
                      await fetch(`/api/lists/${params.id}/items/${it.companyId}`, { method: 'DELETE' });
                      // simple refresh
                      if (typeof window !== 'undefined') window.location.reload();
                    }}>
                      <button className="text-sm px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white">Remove</button>
                    </form>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
