import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useDebounce } from '../../hooks/useDebounce';
import { getArticles } from '../../services/knowledgeService';

const KnowledgeBasePage = () => {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    getArticles({ search: debouncedSearch }).then((res) => {
      setArticles(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [debouncedSearch]);

  return (
    <DashboardLayout title="Knowledge Base">
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm" />
      </div>
      {loading ? <LoadingSpinner /> : articles.length === 0 ? <EmptyState title="No articles found" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} to={`/knowledge/${a.id}`}>
              <Card className="h-full transition hover:shadow-md hover:border-primary-200">
                <h3 className="font-semibold text-slate-900">{a.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{a.problem}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {a.tags?.map((t) => <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{t}</span>)}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default KnowledgeBasePage;
