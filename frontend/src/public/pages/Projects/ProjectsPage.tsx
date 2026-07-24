import React from 'react';
import { motion } from 'framer-motion';
import { useProjects } from '../../hooks/usePublicQueries';
import { ArrowLeft, MapPin, Calendar, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProjectsPage = () => {
  const { data: projectsData, isLoading } = useProjects();

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
      
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl lg:text-5xl font-black mb-6">مشاريعنا</h1>
        <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
          نفخر في DecoZR بمشاركتنا في تنفيذ وتجهيز العديد من المشاريع الرائدة للشركات والأفراد، بجودة عالية ومقاييس عالمية.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-3xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-elevated)] animate-pulse h-96"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {projectsData?.data.map((project, idx) => (
            <Link 
              key={project.id} 
              to={`/project/${project.id}`}
              className="group rounded-3xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-elevated)] hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black/20">
                <img 
                  src={project.images[0]} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                
                <div className="absolute top-6 right-6 flex gap-2">
                  <div className="bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    {project.category}
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/30"></div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.completionDate).getFullYear()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1 justify-between gap-6">
                <p className="text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)] text-sm font-bold text-blue-500 group-hover:text-blue-400 transition-colors">
                  <span>اكتشف تفاصيل المشروع</span>
                  <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};
