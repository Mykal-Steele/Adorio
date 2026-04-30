import AdSenseScript from '../../components/AdSenseScript';

const docs = [
  { title: 'DeepLink Mobile API', file: 'SCB DeepLink Mobile API Developer Guide.html' },
  { title: 'Direct Debit Guide', file: 'SCB Direct Debit API Developer Guide.html' },
  { title: 'Direct Debit Spec', file: 'SCB Direct Debit API Specification.html' },
];

const SmartCity = () => {
  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <AdSenseScript />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Smart City APIs</h1>

        <div className="space-y-4">
          {docs.map((doc) => (
            <a
              key={doc.file}
              href={`/smartcity/${encodeURIComponent(doc.file)}`}
              className="block w-full p-4 text-left bg-gray-800 hover:bg-gray-700 text-white rounded border border-gray-700 transition-colors"
            >
              {doc.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartCity;
