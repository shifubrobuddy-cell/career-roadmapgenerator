import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  Clock, 
  Filter, 
  Award, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  GraduationCap, 
  Globe, 
  Laptop, 
  Zap 
} from 'lucide-react';
import { CareerTrack, LearningResource } from '../types';

interface ResourceHubTabProps {
  activeCareer: CareerTrack;
  careers?: CareerTrack[];
  resources: LearningResource[];
  onToggleBookmark: (resourceId: number) => void;
}

export const ResourceHubTab: React.FC<ResourceHubTabProps> = ({
  activeCareer,
  careers = [],
  resources,
  onToggleBookmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCareerFilter, setSelectedCareerFilter] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState('All');
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);
  const [onlyCertificates, setOnlyCertificates] = useState(false);

  // Filter Logic
  const filteredResources = resources.filter((res) => {
    // Career filter
    const matchesCareer = selectedCareerFilter === 'all' || res.careerId === selectedCareerFilter;
    
    // Search query
    const matchesSearch = 
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.provider && res.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
      res.resourceType.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Format type
    const matchesType = selectedType === 'All' || res.resourceType === selectedType;
    
    // Bookmark filter
    const matchesBookmark = onlyBookmarks ? !!res.isBookmarked : true;
    
    // Free filter
    const matchesFree = onlyFree ? res.isFree : true;
    
    // Certificate filter
    const matchesCert = onlyCertificates ? !!res.hasCertificate : true;

    return matchesCareer && matchesSearch && matchesType && matchesBookmark && matchesFree && matchesCert;
  });

  const getCareerBadgeColor = (careerId: number) => {
    switch (careerId) {
      case 1: return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 2: return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
      case 3: return 'text-violet-400 bg-violet-950/40 border-violet-500/30';
      case 4: return 'text-teal-400 bg-teal-950/40 border-teal-500/30';
      case 5: return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const getCareerName = (careerId: number) => {
    switch (careerId) {
      case 1: return 'Web Developer';
      case 2: return 'Data Analyst';
      case 3: return 'UI/UX Designer';
      case 4: return 'Android Developer';
      case 5: return 'Digital Marketing';
      default: return 'Core Engineering';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header Banner */}
      <div className="rounded-2xl bg-[#0f1422]/95 border border-slate-800 p-6 md:p-8 shadow-xl space-y-5 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 -z-10 h-56 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Curated Engineering Courses & Knowledge Repository</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Learning Resource Hub & Course Directory
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-3xl leading-relaxed">
              Explore 45+ world-class courses, accredited certifications, interactive sandboxes, and official specifications from Harvard CS50, freeCodeCamp, Google Developers, MDN, and Meta.
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setSelectedCareerFilter(activeCareer.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                selectedCareerFilter === activeCareer.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Match My Track ({activeCareer.name})</span>
            </button>

            <button
              onClick={() => setOnlyBookmarks(!onlyBookmarks)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
                onlyBookmarks
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {onlyBookmarks ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{onlyBookmarks ? 'Saved Only' : 'Saved'}</span>
            </button>
          </div>
        </div>

        {/* Career Track Filter Pills */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-emerald-400" />
            <span>Discipline:</span>
          </span>
          <button
            onClick={() => setSelectedCareerFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCareerFilter === 'all'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            All Tracks ({resources.length})
          </button>
          <button
            onClick={() => setSelectedCareerFilter(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCareerFilter === 1
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400 font-bold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            Web Developer ({resources.filter(r => r.careerId === 1).length})
          </button>
          <button
            onClick={() => setSelectedCareerFilter(2)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCareerFilter === 2
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 font-bold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            Data Analyst ({resources.filter(r => r.careerId === 2).length})
          </button>
          <button
            onClick={() => setSelectedCareerFilter(3)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCareerFilter === 3
                ? 'bg-violet-500/25 text-violet-300 border-violet-400 font-bold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            UI/UX Designer ({resources.filter(r => r.careerId === 3).length})
          </button>
          <button
            onClick={() => setSelectedCareerFilter(4)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCareerFilter === 4
                ? 'bg-teal-500/25 text-teal-300 border-teal-400 font-bold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            Android Developer ({resources.filter(r => r.careerId === 4).length})
          </button>
          <button
            onClick={() => setSelectedCareerFilter(5)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              selectedCareerFilter === 5
                ? 'bg-amber-500/25 text-amber-300 border-amber-400 font-bold'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            Digital Marketing ({resources.filter(r => r.careerId === 5).length})
          </button>
        </div>

        {/* Search & Sub-Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by topic, university, platform (e.g. CS50, React, SQL, Figma, Kotlin, SEO)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Formats</option>
              <option value="Free Course">Free Online Courses</option>
              <option value="Certification">Industry Certifications</option>
              <option value="Interactive Sandbox">Interactive Sandboxes</option>
              <option value="Official Documentation">Official Documentation</option>
              <option value="Deep Dive Guide">Guides & Books</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <button
              onClick={() => setOnlyCertificates(!onlyCertificates)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                onlyCertificates
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>With Certificate</span>
            </button>

            <button
              onClick={() => setOnlyFree(!onlyFree)}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                onlyFree
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Free</span>
            </button>
          </div>
        </div>

        {/* Counter Stats bar */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
          <span>Showing {filteredResources.length} of {resources.length} courses & materials</span>
          <span>Open any link directly in a new tab • No paywalls required</span>
        </div>
      </div>

      {/* Grid of Courses & Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => {
          const careerBadgeStyle = getCareerBadgeColor(res.careerId);
          const careerName = getCareerName(res.careerId);

          return (
            <div
              key={res.id}
              className="rounded-2xl bg-[#0f1422]/95 border border-slate-800 p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 hover:shadow-2xl transition group shadow-lg relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${careerBadgeStyle}`}>
                      {careerName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono font-medium text-slate-300">
                      {res.resourceType}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(res.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 transition"
                    title={res.isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
                  >
                    {res.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Provider Tag */}
                {res.provider && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{res.provider}</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition line-clamp-2 leading-snug">
                  {res.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {res.description}
                </p>

                {/* Badges: Certificate / Level */}
                <div className="flex items-center gap-2 pt-1">
                  {res.hasCertificate && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>Certificate Included</span>
                    </span>
                  )}
                  {res.difficulty && (
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono">
                      {res.difficulty}
                    </span>
                  )}
                  {res.isFree && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      Free Access
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>~{res.estimatedHours}h duration</span>
                </div>

                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-bold text-xs flex items-center gap-1.5 transition shadow-sm group-hover:border-emerald-400"
                >
                  <span>Open Course</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}

        {filteredResources.length === 0 && (
          <div className="col-span-full rounded-2xl bg-[#0f1422]/60 border border-slate-800 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No matching learning resources found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search terms or clearing one of the filters to see available courses and documentation.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCareerFilter('all');
                setSelectedType('All');
                setOnlyBookmarks(false);
                setOnlyCertificates(false);
                setOnlyFree(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-400 hover:bg-slate-800 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
