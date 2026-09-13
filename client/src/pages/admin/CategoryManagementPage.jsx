import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import { getCategories } from '../../services/categoryService';

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => { getCategories().then(setCategories); }, []);

  return (
    <DashboardLayout title="Categories">
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((cat) => (
          <Card key={cat.id} title={cat.name}>
            <p className="mb-3 text-xs text-slate-500">{cat.description}</p>
            <div className="flex flex-wrap gap-2">
              {cat.subcategories?.map((sub) => (
                <span key={sub.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{sub.name}</span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CategoryManagementPage;
