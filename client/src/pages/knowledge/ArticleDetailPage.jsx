import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getArticle } from '../../services/knowledgeService';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticle(id).then(setArticle).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout title="Article"><LoadingSpinner /></DashboardLayout>;
  if (!article) return <DashboardLayout title="Article"><p>Not found</p></DashboardLayout>;

  return (
    <DashboardLayout title={article.title}>
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-primary-600 hover:underline">← Back to Knowledge Base</button>
      <div className="space-y-4">
        <Card title="Problem / Symptoms"><p className="whitespace-pre-wrap text-sm text-slate-700">{article.problem}</p></Card>
        <Card title="Troubleshooting Steps"><p className="whitespace-pre-wrap text-sm text-slate-700">{article.troubleshootingSteps}</p></Card>
        <Card title="Resolution"><p className="whitespace-pre-wrap text-sm text-slate-700">{article.resolution}</p></Card>
        <p className="text-xs text-slate-400">By {article.author?.firstName} {article.author?.lastName} · {article.category?.name}</p>
      </div>
    </DashboardLayout>
  );
};

export default ArticleDetailPage;
