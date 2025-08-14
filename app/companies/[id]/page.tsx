import Image from 'next/image';

export const dynamic = 'force-dynamic';

async function getCompanies() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || ''}/api/companies`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const companies = await getCompanies();
  const company = companies.find((c: any) => String(c.id) === String(params.id));
  if (!company) return <div className="w-11/12 mx-auto px-6 py-6">Company not found.</div>;

  return (
    <div className="w-11/12 mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <a href="/lists" className="text-sm text-blue-600 hover:underline">Back to lists</a>
      </div>

      <div className="bg-white border rounded p-5 flex gap-4 items-start">
        {company.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.logo} alt="" className="w-20 h-20 rounded object-cover border" />
        ) : (
          <div className="w-20 h-20 rounded bg-gray-200" />)
        }
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{company.name}</h1>
          {company.website && (
            <a href={company.website} target="_blank" className="text-sm text-blue-600 hover:underline">{company.website}</a>
          )}
          {company.industry && <div className="text-sm text-gray-600 mt-1">{company.industry}</div>}
        </div>
      </div>

      <div className="bg-white border rounded p-5 grid md:grid-cols-2 gap-4 text-sm">
        <div><span className="text-gray-500">Country:</span> {company.country || '-'}</div>
        <div><span className="text-gray-500">Sub-industry:</span> {company.subIndustry || '-'}</div>
        <div><span className="text-gray-500">Founded:</span> {company.yearFounded || '-'}</div>
        <div><span className="text-gray-500">Employees:</span> {company.employees || '-'}</div>
        <div><span className="text-gray-500">History:</span> {company.history ?? '-'}</div>
        <div><span className="text-gray-500">Brand Awareness:</span> {company.brandAwareness ?? '-'}</div>
        <div><span className="text-gray-500">Moat:</span> {company.moat ?? '-'}</div>
        <div><span className="text-gray-500">Size:</span> {company.size ?? '-'}</div>
        <div><span className="text-gray-500">Innovation:</span> {company.innovation ?? '-'}</div>
        <div><span className="text-gray-500">Total:</span> {company.total ?? '-'}</div>
      </div>

      {company.description && (
        <div className="bg-white border rounded p-5">
          <div className="font-semibold mb-2">Description</div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{company.description}</p>
        </div>
      )}
    </div>
  );
}
