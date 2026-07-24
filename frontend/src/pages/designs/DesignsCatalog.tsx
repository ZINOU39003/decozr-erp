import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, FolderTree, Image as ImageIcon } from 'lucide-react';
import { getDesignCategories, getDesigns, createDesign } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const LIBRARY_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: 'مسودة', className: 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]' },
  private: { label: 'خاص', className: 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]' },
  public: { label: 'عام', className: 'bg-[var(--color-success)]/20 text-[var(--color-success)]' },
  archived: { label: 'مؤرشف', className: 'bg-[var(--color-danger)]/20 text-[var(--color-danger)]' },
};

const unwrapList = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
  return [];
};

export const DesignsCatalog = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categoriesRaw, isLoading: catsLoading } = useQuery({
    queryKey: ['design-categories'],
    queryFn: getDesignCategories,
  });

  const { data: designsRaw, isLoading: desLoading } = useQuery({
    queryKey: ['designs'],
    queryFn: () => getDesigns(),
  });

  const createMutation = useMutation({
    mutationFn: createDesign,
    onSuccess: (created: any) => {
      queryClient.invalidateQueries({ queryKey: ['designs'] });
      toast.success('تم إنشاء التصميم');
      const id = created?.id || created?.data?.id;
      if (id) navigate(`/designs/${id}`);
      else navigate('/designs/new');
    },
    onError: () => toast.error('فشل إنشاء التصميم'),
  });

  const categories = unwrapList(categoriesRaw);
  const designs = unwrapList(designsRaw);
  const loading = catsLoading || desLoading;

  const filteredDesigns = designs
    .filter((d) =>
      activeCategory ? d.category_id === activeCategory || d.category === activeCategory : true
    )
    .filter(
      (d) =>
        (d?.name_ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d?.code || d?.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>كتالوج التصاميم</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>تصفح، بحث، وإدارة تصاميم الورشة</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
                width: '1rem',
                height: '1rem',
              }}
            />
            <Input
              type="text"
              placeholder="ابحث عن تصميم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingRight: '2.5rem', background: 'var(--color-bg-card)' }}
            />
          </div>
          <Button
            onClick={() => navigate('/designs/new')}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--color-primary-600)', color: 'white' }}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            <span>تصميم جديد</span>
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '0.5rem', gap: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500',
            whiteSpace: 'nowrap',
            border: 'none',
            cursor: 'pointer',
            background: activeCategory === null ? 'var(--color-primary-500)' : 'var(--color-bg-card)',
            color: activeCategory === null ? 'white' : 'var(--color-text-muted)',
          }}
        >
          الكل ({designs.length})
        </button>
        {categories.map((cat: any) => {
          const count = designs.filter((d) => d.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: activeCategory === cat.id ? 'var(--color-primary-500)' : 'var(--color-bg-card)',
                color: activeCategory === cat.id ? 'white' : 'var(--color-text-muted)',
              }}
            >
              <span>{cat.name_ar}</span>
              <span style={{ fontSize: '0.75rem', padding: '0.125rem 0.375rem', borderRadius: '9999px', background: 'rgba(0,0,0,0.2)' }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ height: '16rem', background: 'var(--color-bg-card)', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }} />
                <div style={{ height: '1rem', background: 'var(--color-bg-card)', borderRadius: '0.25rem', width: '75%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {filteredDesigns.map((design: any) => {
              const currentVersion =
                design.versions?.find((v: any) => v.id === design.current_version_id) ||
                design.versions?.[0] || { version_number: 1 };
              const displayImg = design.image_url || design.file_url || design.thumbnail_url;
              const statusMeta = LIBRARY_STATUS_LABELS[design.library_status] || LIBRARY_STATUS_LABELS.draft;
              return (
                <div
                  key={design.id}
                  className="group"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '1rem',
                    padding: '0.75rem',
                  }}
                  onClick={() => navigate(`/designs/${design.id}`)}
                >
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '4/3',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      background: 'var(--color-bg-main)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {displayImg ? (
                      <img src={displayImg} alt={design.name_ar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon style={{ width: '3rem', height: '3rem', color: 'var(--color-text-muted)', opacity: 0.4 }} />
                    )}
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <Badge className="bg-black/70 text-white backdrop-blur-md border-0">{design.code || design.sku || design.id}</Badge>
                      <Badge className={`border-0 ${statusMeta.className}`}>{statusMeta.label}</Badge>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 0.25rem' }}>
                    <div>
                      <h3 style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{design.name_ar}</h3>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        {design.category?.name_ar || 'بدون فئة'}
                      </p>
                    </div>
                    <Badge variant="outline" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                      v{currentVersion.version_number || 1}.0
                    </Badge>
                  </div>
                </div>
              );
            })}

            {filteredDesigns.length === 0 && (
              <div
                style={{
                  gridColumn: '1/-1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6rem 0',
                  color: 'var(--color-text-muted)',
                }}
              >
                <div
                  style={{
                    width: '6rem',
                    height: '6rem',
                    borderRadius: '50%',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <FolderTree size={40} style={{ opacity: 0.5 }} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
                  {designs.length === 0 ? 'لا توجد تصاميم بعد' : 'لا توجد تصاميم مطابقة'}
                </h3>
                <p>
                  {designs.length === 0
                    ? 'ابدأ بإنشاء أول تصميم للورشة'
                    : 'جرب تغيير كلمات البحث أو الفلتر المستخدم'}
                </p>
                {designs.length === 0 ? (
                  <Button
                    onClick={() => navigate('/designs/new')}
                    style={{ marginTop: '1.5rem', background: 'var(--color-primary-600)', color: 'white' }}
                    disabled={createMutation.isPending}
                  >
                    إنشاء تصميم
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory(null);
                    }}
                    variant="outline"
                    style={{ marginTop: '1.5rem' }}
                  >
                    مسح الفلاتر
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
