import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProjects } from '../../hooks/usePublicQueries';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Building2, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  // We use useProjects and filter locally since we don't have a specific getProjectById endpoint yet
  // In a real app we'd have a specific useProjectDetail hook
  const { data: projectsData, isLoading } = useProjects(1, 100);
  const project = projectsData?.data.find(p => p.id === id);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-8 w-1/4 bg-[var(--color-bg-elevated)] rounded mb-8"></div>
        <div className="h-[500px] bg-[var(--color-bg-elevated)] rounded-3xl mb-12"></div>
        <div className="h-10 w-2/3 bg-[var(--color-bg-elevated)] rounded mb-6"></div>
        <div className="h-32 w-full bg-[var(--color-bg-elevated)] rounded"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl font-black mb-4">المشروع غير موجود</h1>
        <p className="text-[var(--color-text-secondary)] mb-8">عذراً، لم نتمكن من العثور على المشروع الذي تبحث عنه.</p>
        <Link to="/projects">
          <Button>العودة للمشاريع</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-8 font-bold">
        <Link to="/" className="hover:text-blue-500 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/projects" className="hover:text-blue-500 transition-colors">المشاريع</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[var(--color-text-main)]">{project.title}</span>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-[var(--color-bg-elevated)] border border-[var(--color-border)] mb-12">
        <img 
          src={project.images[activeImage]} 
          alt={project.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 w-fit">
              <Building2 className="w-4 h-4" />
              {project.category}
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-white/90 text-lg font-bold">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              {project.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              {new Date(project.completionDate).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Gallery */}
          <div>
            <h2 className="text-2xl font-black mb-6">معرض الصور</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {project.images.map((img, idx) => (
                <button 
                  key={idx}
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-transparent hover:border-[var(--color-border)]'}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-black mb-6">عن المشروع</h2>
            <div className="text-[var(--color-text-secondary)] text-lg leading-loose space-y-4">
              <p>{project.description}</p>
              <p>
                تم تنفيذ هذا المشروع وفقاً لأعلى معايير الجودة، مع التركيز على الاستغلال الأمثل للمساحات وتوفير بيئة عمل/سكن مريحة وعصرية. لقد عمل فريق DecoZR عن كثب مع العميل لضمان تحقيق رؤيته بأدق التفاصيل.
              </p>
            </div>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-2xl font-black mb-6">أبرز الأعمال المنفذة</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[var(--color-bg-elevated)] p-4 rounded-2xl border border-[var(--color-border)]">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-3xl border border-[var(--color-border)]">
            <h3 className="text-xl font-black mb-6">معلومات المشروع</h3>
            <ul className="space-y-6">
              <li className="flex flex-col gap-1">
                <span className="text-sm text-[var(--color-text-muted)] font-bold">العميل</span>
                <span className="font-bold text-lg">{project.client}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-sm text-[var(--color-text-muted)] font-bold">الموقع</span>
                <span className="font-bold text-lg">{project.location}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-sm text-[var(--color-text-muted)] font-bold">تاريخ الإنجاز</span>
                <span className="font-bold text-lg">{new Date(project.completionDate).toLocaleDateString('ar-SA')}</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-sm text-[var(--color-text-muted)] font-bold">نوع المشروع</span>
                <span className="font-bold text-lg">{project.category}</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-2xl font-black mb-4 relative z-10">هل أعجبك هذا المشروع؟</h3>
            <p className="text-white/80 mb-8 relative z-10 leading-relaxed">
              يمكننا تنفيذ مشروع مشابه لك أو تصميم فكرة جديدة تماماً تناسب احتياجاتك.
            </p>
            <Link to="/request-quote" className="block relative z-10">
              <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold h-14 rounded-xl text-lg">
                اطلب عرض سعر
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
