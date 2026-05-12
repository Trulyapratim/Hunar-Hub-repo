/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Search, Send, LogOut, 
  Star, MessageSquare, Check, X, 
  BookOpen, GraduationCap,
  ArrowRight, Heart,
  Zap, Filter, Plus,
  Award, Menu, Edit2, ChevronLeft,
  ExternalLink, Github, Globe, Trash2
} from 'lucide-react';

import { 
  User, Request as SkillRequest, Rating, PageId, Toast, Project 
} from './types';
import { 
  getUsers, saveUsers, getRequests, saveRequests, 
  getRatings, saveRatings, getCurrentUser, setCurrentUserId,
  seedData, generateId, hashColor, calculateUserRating,
  getProjects, saveProjects
} from './services/storageService';

import { Avatar } from './components/Avatar';
import { Modal } from './components/Modal';
import { ToastProvider } from './components/Toast';

interface BrowsePageProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  uniqueSkills: string[];
  activeFilter: string;
  setActiveFilter: (f: string) => void;
  filteredUsers: User[];
  currentUser: User | null;
  allRequests: SkillRequest[];
  setTargetUser: (u: User | null) => void;
  setRequestMessage: (m: string) => void;
  setIsRequestModalOpen: (open: boolean) => void;
  getMatchScore: (user: User) => number;
  isSmartMatch: (user: User) => boolean;
  navigateTo: (page: PageId, profileId?: string) => void;
}

function BrowsePage({
  searchQuery,
  setSearchQuery,
  uniqueSkills,
  activeFilter,
  setActiveFilter,
  filteredUsers,
  currentUser,
  allRequests,
  setTargetUser,
  setRequestMessage,
  setIsRequestModalOpen,
  getMatchScore,
  isSmartMatch,
  navigateTo
}: BrowsePageProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-4 mb-12">
         <div className="flex-1 relative group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
           <input 
             id="search-input"
             type="text" 
             value={searchQuery}
             placeholder="Search skills or names..." 
             onChange={e => setSearchQuery(e.target.value)} 
             className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-100 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none bg-white font-medium" 
           />
           {searchQuery && (
             <button 
               onClick={() => setSearchQuery('')}
               className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
             >
               <X size={16} />
             </button>
           )}
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
            {uniqueSkills.map(s => (
              <button 
                key={s} 
                onClick={() => setActiveFilter(s)} 
                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all ${activeFilter === s ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
              >
                {s}
              </button>
            ))}
         </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="text-gray-300" size={32} />
          </div>
          <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">No students found</h3>
          <p className="text-gray-400 max-w-sm mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
            className="mt-8 px-8 py-3 text-primary font-bold hover:bg-gray-50 rounded-xl transition-all"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredUsers.map(user => {
            const matchScore = getMatchScore(user);
            const hasSentRequest = allRequests.some(r => r.senderId === currentUser?.id && r.receiverId === user.id && r.status === 'pending');
            const existingRequest = allRequests.find(r => r.senderId === currentUser?.id && r.receiverId === user.id);

            return (
              <div 
                key={user.id} 
                className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative transition-all hover:shadow-xl hover:-translate-y-1 stagger-card ${matchScore === 3 ? 'glow-match' : ''}`}
              >
                {matchScore === 3 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1 animate-pulse-soft">
                    <Zap size={10} fill="currentColor" /> PERFECT MATCH
                  </div>
                )}
                {matchScore === 2 && !isSmartMatch(user) && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                    <GraduationCap size={10} fill="currentColor" /> TEACHER MATCH
                  </div>
                )}
                <div className="flex gap-4 mb-6">
                  <div className="cursor-pointer transition-transform hover:scale-110" onClick={() => navigateTo('profile', user.id)}>
                    <Avatar name={user.name} color={user.avatarColor} url={user.avatarUrl} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg cursor-pointer hover:text-primary transition-colors" onClick={() => navigateTo('profile', user.id)}>{user.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">{user.college}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs font-bold">
                       <Star size={12} className={user.rating > 0 ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} fill={user.rating > 0 ? "currentColor" : "none"} />
                       <span className={user.rating > 0 ? "text-yellow-600" : "text-gray-400"}>
                        {user.rating > 0 ? user.rating.toFixed(1) : "New"}
                       </span>
                       <span className="text-gray-300 ml-1">({user.ratingCount})</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Can Teach</p>
                     <div className="flex flex-wrap gap-2">
                      {user.canTeach.map(s => {
                        const isWantedByMe = currentUser?.wantToLearn.map(x => x.toLowerCase()).includes(s.toLowerCase());
                        return (
                          <span key={s} className={`text-[10px] px-3 py-1 rounded-md font-bold transition-all ${isWantedByMe ? 'bg-accent text-white shadow-sm' : 'bg-tag-bg text-tag-text'}`}>
                            {s}
                          </span>
                        );
                      })}
                     </div>
                   </div>
                   <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Wants to Learn</p>
                     <div className="flex flex-wrap gap-2">
                        {user.wantToLearn.map(s => {
                          const iCanTeachThem = currentUser?.canTeach.map(x => x.toLowerCase()).includes(s.toLowerCase());
                          return (
                            <span key={s} className={`text-[10px] px-3 py-1 rounded-md font-bold border transition-all ${iCanTeachThem ? 'bg-primary text-white border-primary shadow-sm' : 'bg-orange-50 text-accent border-orange-100'}`}>
                              {s}
                            </span>
                          );
                        })}
                     </div>
                   </div>
                </div>
                <button 
                  disabled={!!hasSentRequest}
                  onClick={() => { 
                    setTargetUser(user); 
                    setRequestMessage(`Hi ${user.name}! I saw you can teach ${user.canTeach[0]}. I'd love to learn that and can help you with ${currentUser?.canTeach[0] || 'skills'}.`); 
                    setIsRequestModalOpen(true); 
                  }}
                  className={`w-full py-3 rounded-2xl text-sm font-bold shadow-lg transition-all transform active:scale-[0.98] ${hasSentRequest ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-primary text-white shadow-primary/20 hover:bg-slate-800'}`}
                >
                  {hasSentRequest ? 'Pending Request' : (existingRequest ? 'Send Another' : 'Send Request')}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface OpenProjectsPageProps {
  allProjects: Project[];
  currentUser: User | null;
  allUsers: User[];
  allRequests: SkillRequest[];
  setTargetProject: (p: Project | null) => void;
  setRequestMessage: (m: string) => void;
  setRequestType: (t: 'learning' | 'project') => void;
  setIsRequestModalOpen: (open: boolean) => void;
  navigateTo: (page: PageId, profileId?: string) => void;
}

function OpenProjectsPage({
  allProjects,
  currentUser,
  allUsers,
  allRequests,
  setTargetProject,
  setRequestMessage,
  setRequestType,
  setIsRequestModalOpen,
  navigateTo
}: OpenProjectsPageProps) {
  const [roleFilter, setRoleFilter] = useState('All');
  
  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    allProjects.forEach(p => p.rolesNeeded.forEach(r => roles.add(r)));
    return ['All', ...Array.from(roles)];
  }, [allProjects]);

  const filteredProjects = allProjects.filter(p => {
    if (roleFilter === 'All') return true;
    return p.rolesNeeded.includes(roleFilter);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary mb-2">Collaboration Board</h1>
          <p className="text-gray-400">Find projects looking for your skills.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear w-full md:w-auto">
          {uniqueRoles.map(r => (
            <button 
              key={r} 
              onClick={() => setRoleFilter(r)} 
              className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap border transition-all ${roleFilter === r ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
            <BookOpen size={32} />
          </div>
          <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">No projects found</h3>
          <p className="text-gray-400">Try adjusting your role filter.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => {
            const owner = allUsers.find(u => u.id === project.ownerId);
            const isOwner = project.ownerId === currentUser?.id;
            const hasSentRequest = allRequests.some(r => r.senderId === currentUser?.id && r.receiverId === project.ownerId && r.type === 'project' && r.status === 'pending');
            
            const skillMatch = project.rolesNeeded.some(role => 
              currentUser?.canTeach.some(skill => skill.toLowerCase() === role.toLowerCase())
            );

            return (
              <div key={project.id} className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-50 flex flex-col hover:shadow-xl hover:border-primary/10 transition-all stagger-card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="cursor-pointer transition-transform hover:scale-110" onClick={() => navigateTo('profile', owner?.id)}>
                      <Avatar name={owner?.name || "?"} color={owner?.avatarColor} url={owner?.avatarUrl} size="sm" />
                    </div>
                    <div>
                      <p className="text-xs font-bold cursor-pointer hover:text-primary" onClick={() => navigateTo('profile', owner?.id)}>{owner?.name}</p>
                      <p className="text-[10px] text-gray-400">{owner?.college}</p>
                    </div>
                  </div>
                  {skillMatch && (
                    <div className="bg-orange-50 text-accent px-3 py-1 rounded-full text-[10px] font-bold border border-orange-100 flex items-center gap-1 animate-pulse-soft">
                      <Zap size={10} fill="currentColor" /> SKILL MATCH
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-display font-bold text-primary mb-3">{project.title}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-3">{project.description}</p>
                
                <div className="mt-auto space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tech Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map(t => (
                        <span key={t} className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-gray-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Roles Needed</p>
                    <div className="flex flex-wrap gap-2">
                      {project.rolesNeeded.map(r => (
                        <span key={r} className="bg-primary/5 text-primary px-2.5 py-1 rounded-md text-[10px] font-bold border border-primary/10">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      disabled={isOwner || hasSentRequest}
                      onClick={() => {
                        setTargetProject(project);
                        setRequestType('project');
                        setRequestMessage(`Hi! I'm interested in joining ${project.title}. I can help with ${project.rolesNeeded[0] || 'the project'}.`);
                        setIsRequestModalOpen(true);
                      }}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${isOwner ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : hasSentRequest ? 'bg-green-50 text-green-600 border border-green-100 shadow-none' : 'bg-primary text-white shadow-primary/20 hover:bg-slate-800'}`}
                    >
                      {isOwner ? 'Your Project' : hasSentRequest ? 'Application Sent' : 'Join Project'}
                    </button>
                    {(project.githubUrl || project.liveUrl) && (
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 text-gray-400 hover:text-primary rounded-xl transition-all border border-gray-100">
                            <Github size={18} />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 text-gray-400 hover:text-primary rounded-xl transition-all border border-gray-100">
                            <Globe size={18} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [viewedProfileId, setViewedProfileId] = useState<string | null>(null);
  const [currentUser, setLocalCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allRequests, setAllRequests] = useState<SkillRequest[]>([]);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestType, setRequestType] = useState<'learning' | 'project'>('learning');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [targetProject, setTargetProject] = useState<Project | null>(null);

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [targetRequest, setTargetRequest] = useState<SkillRequest | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    seedData();
    refreshData();
  }, []);

  const refreshData = () => {
    const users = getUsers();
    setAllUsers(users);
    setAllRequests(getRequests());
    setAllRatings(getRatings());
    setAllProjects(getProjects());
    const curr = getCurrentUser();
    setLocalCurrentUser(curr);
    if (curr && (currentPage === 'landing' || currentPage === 'login' || currentPage === 'signup')) {
      setCurrentPage('browse');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateTo = (page: PageId, profileId?: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentPage(page);
      setViewedProfileId(profileId || null);
      window.scrollTo(0, 0);
    }, 300);
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setLocalCurrentUser(null);
    navigateTo('landing');
    showToast('Logged out successfully', 'info');
  };

  // --- Auth Handlers ---
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const user = allUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUserId(user.id);
      setLocalCurrentUser(user);
      navigateTo('browse');
      showToast(`Welcome back, ${user.name}!`, 'success');
    } else {
      showToast('Invalid email or password', 'error');
    }
  };

  const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.currentTarget);
    const techStack = (formData.get('techStack') as string).split(',').map(s => s.trim()).filter(Boolean);
    const rolesNeeded = (formData.get('rolesNeeded') as string).split(',').map(s => s.trim()).filter(Boolean);

    const newProject: Project = {
      id: generateId(),
      ownerId: currentUser.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      techStack,
      rolesNeeded,
      githubUrl: formData.get('githubUrl') as string,
      liveUrl: formData.get('liveUrl') as string,
      createdAt: new Date().toISOString(),
    };

    const updatedProjects = [newProject, ...allProjects];
    saveProjects(updatedProjects);
    setAllProjects(updatedProjects);
    showToast('Project added to your portfolio!', 'success');
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = allProjects.filter(p => p.id !== projectId);
    saveProjects(updated);
    setAllProjects(updated);
    showToast('Project removed', 'info');
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>, csvCanTeach: string, csvWantToLearn: string, avatarUrl?: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    if (allUsers.some(u => u.email === email)) {
      showToast('Email already registered', 'error');
      return;
    }

    const canTeach = csvCanTeach.split(',').map(s => s.trim()).filter(Boolean);
    const wantToLearn = csvWantToLearn.split(',').map(s => s.trim()).filter(Boolean);

    const newUser: User = {
      id: generateId(),
      name: formData.get('name') as string,
      email: email,
      password: formData.get('password') as string,
      college: formData.get('college') as string,
      year: formData.get('year') as string,
      branch: formData.get('branch') as string,
      bio: formData.get('bio') as string,
      avatarColor: hashColor(formData.get('name') as string),
      avatarUrl,
      canTeach,
      wantToLearn,
      rating: 0,
      ratingCount: 0,
      joinedAt: new Date().toISOString()
    };

    const updatedUsers = [...allUsers, newUser];
    saveUsers(updatedUsers);
    setAllUsers(updatedUsers);
    setCurrentUserId(newUser.id);
    setLocalCurrentUser(newUser);
    navigateTo('browse');
    showToast('Account created! Welcome to HunarHub.', 'success');
  };

  // --- Request Handlers ---
  const handleSendRequest = () => {
    if (!currentUser || (!targetUser && !targetProject)) return;
    
    const newRequest: SkillRequest = {
      id: generateId(),
      senderId: currentUser.id,
      receiverId: targetProject ? targetProject.ownerId : (targetUser?.id || ''),
      message: requestMessage,
      status: 'pending',
      type: requestType,
      portfolioLink: requestType === 'project' ? portfolioLink : undefined,
      createdAt: new Date().toISOString()
    };

    const updatedRequests = [...allRequests, newRequest];
    saveRequests(updatedRequests);
    setAllRequests(updatedRequests);
    setIsRequestModalOpen(false);
    setRequestMessage('');
    setPortfolioLink('');
    showToast('Your request has been sent!', 'success');
  };

  const handleUpdateRequestStatus = (requestId: string, status: 'accepted' | 'declined') => {
    const updated = allRequests.map(r => r.id === requestId ? { ...r, status } : r);
    saveRequests(updated);
    setAllRequests(updated);
    showToast(`Request ${status}`, status === 'accepted' ? 'success' : 'info');
  };

  // --- Rating Handlers ---
  const handleSubmitRating = () => {
    if (!currentUser || !targetRequest) return;
    
    const targetUserId = targetRequest.senderId === currentUser.id ? targetRequest.receiverId : targetRequest.senderId;

    const newRating: Rating = {
      id: generateId(),
      fromUserId: currentUser.id,
      toUserId: targetUserId,
      requestId: targetRequest.id,
      stars: ratingStars,
      review: ratingReview,
      createdAt: new Date().toISOString()
    };

    const updatedRatings = [...allRatings, newRating];
    saveRatings(updatedRatings);
    setAllRatings(updatedRatings);

    // Update user average rating
    const { rating: avgRating, count: ratingCount } = calculateUserRating(updatedRatings, targetUserId);
    
    const updatedUsers = allUsers.map(u => u.id === targetUserId ? { ...u, rating: avgRating, ratingCount } : u);
    saveUsers(updatedUsers);
    setAllUsers(updatedUsers);

    setIsRatingModalOpen(false);
    setRatingStars(5);
    setRatingReview('');
    showToast('Thank you for your review!', 'success');
  };

  const getMatchScore = (user: User) => {
    if (!currentUser) return 0;
    const myWants = currentUser.wantToLearn.map(s => s.toLowerCase());
    const theirCans = user.canTeach.map(s => s.toLowerCase());
    const myCans = currentUser.canTeach.map(s => s.toLowerCase());
    const theirWants = user.wantToLearn.map(s => s.toLowerCase());

    const theyHaveWhatIWant = theirCans.some(s => myWants.includes(s.toLowerCase()));
    const theyWantWhatIHave = myCans.some(s => theirWants.includes(s.toLowerCase()));

    if (theyHaveWhatIWant && theyWantWhatIHave) return 3; // Perfect Match
    if (theyHaveWhatIWant) return 2; // Teacher Match
    if (theyWantWhatIHave) return 1; // Student Match
    return 0;
  };

  const isSmartMatch = (user: User) => {
    return getMatchScore(user) === 3;
  };

  // --- Filter Logic ---
  const uniqueSkills = useMemo(() => {
    const skills = new Set<string>();
    allUsers.forEach(u => u.canTeach.forEach(s => skills.add(s)));
    const base = ['All'];
    if (currentUser) base.push('✨ Matches');
    return [...base, ...Array.from(skills).sort()];
  }, [allUsers, currentUser]);

  const filteredUsers = useMemo(() => {
    const list = allUsers.filter(u => {
      if (u.id === currentUser?.id) return false;
      const q = searchQuery.toLowerCase();
      const matchesSearch = u.name.toLowerCase().includes(q) || 
                            u.canTeach.some(s => s.toLowerCase().includes(q)) ||
                            u.wantToLearn.some(s => s.toLowerCase().includes(q));
      
      let matchesFilter = activeFilter === 'All' || u.canTeach.some(s => s.toLowerCase() === activeFilter.toLowerCase());
      if (activeFilter === '✨ Matches' && currentUser) {
        matchesFilter = getMatchScore(u) > 0;
      }
      return matchesSearch && matchesFilter;
    });

    return list.sort((a, b) => {
      const scoreA = getMatchScore(a);
      const scoreB = getMatchScore(b);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.rating - a.rating;
    });
  }, [allUsers, currentUser, searchQuery, activeFilter, getMatchScore]);


  // --- Sub-Components ---
  const LandingPage = () => (
    <div className="min-h-screen bg-primary">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="text-white w-6 h-6" />
          </div>
          <span className="text-white text-2xl font-display font-bold">HunarHub</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigateTo('login')} className="px-6 py-2 text-white font-medium hover:text-accent transition-colors">Login</button>
          <button onClick={() => navigateTo('signup')} className="px-6 py-2 bg-accent text-white rounded-lg font-bold shadow-lg hover:bg-orange-600 transition-all">Get Started</button>
        </div>
      </nav>

      <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">Exchange Skills.<br/><span className="text-primary-light italic">Grow Together.</span></h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">Find students who know what you want to learn. Teach what you know. No money. Just knowledge.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => navigateTo('signup')} className="px-10 py-4 bg-accent text-white rounded-xl font-bold text-lg shadow-xl hover:bg-orange-600 transition-all">Start Now</button>
          <button onClick={() => navigateTo('browse')} className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 backdrop-blur-md transition-all">Browse Students</button>
        </div>
      </section>

      <section className="bg-background py-24 px-6 grid md:grid-cols-3 gap-12 max-w-7xl mx-auto rounded-t-[3rem]">
        {[
          { icon: <BookOpen />, title: "Offer Your Skills", desc: "List what you’re good at, from coding to photography." },
          { icon: <Search />, title: "Find Your Match", desc: "Our algorithm finds students with complementary skill lists." },
          { icon: <Award />, title: "Exchange & Grow", desc: "Send a request, connect, and help each other level up." }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-tag-bg text-primary rounded-full flex items-center justify-center mb-6">{feat.icon}</div>
            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
            <p className="text-text-medium">{feat.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );

  const LoginPage = () => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-2xl font-display font-bold text-center mb-8">Welcome Back</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input name="email" type="email" required placeholder="College Email" className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-primary" />
          <input name="password" type="password" required placeholder="Password" className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-primary" />
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">Login</button>
        </form>
        <p className="mt-8 text-center text-text-medium">Don't have an account? <button onClick={() => navigateTo('signup')} className="text-primary font-bold">Sign Up</button></p>
      </div>
    </div>
  );

  const SignUpPage = () => {
    const [canTeachInput, setCanTeachInput] = useState('');
    const [wantLearnInput, setWantLearnInput] = useState('');
    const [bioCount, setBioCount] = useState(0);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

    const popularSkills = ["React", "Python", "DSA", "Guitar", "Video Editing", "Spoken English", "Figma", "Excel", "JavaScript", "SQL"];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast('Image size should be less than 2MB', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="min-h-screen py-12 px-6 bg-background flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-display font-bold text-primary text-center mb-8">Join HunarHub</h1>
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <Avatar name={avatarUrl ? "User" : "?"} url={avatarUrl} size="xl" className="border-4 border-gray-50 shadow-inner" />
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-800 transition-all border-4 border-white">
                <Plus size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Photo</p>
          </div>

          <form onSubmit={(e) => handleSignup(e, canTeachInput, wantLearnInput, avatarUrl)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input name="name" type="text" required placeholder="Full Name" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-all" />
              <input name="email" type="email" required placeholder="College Email" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-all" />
            </div>
            <input name="password" type="password" required minLength={6} placeholder="Password (Min 6 chars)" className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-all" />
            <div className="grid md:grid-cols-3 gap-4">
              <input name="college" type="text" required placeholder="College Name" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-all" />
              <select name="year" className="p-4 rounded-xl border border-gray-200 bg-white outline-none focus:border-primary transition-all">
                <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
              </select>
              <select name="branch" className="p-4 rounded-xl border border-gray-200 bg-white outline-none focus:border-primary transition-all">
                <option>CSE</option><option>ECE</option><option>ME</option><option>Civil</option><option>EEE</option><option>IT</option><option>Other</option>
              </select>
            </div>
            <div className="relative">
              <textarea name="bio" required maxLength={150} onChange={(e) => setBioCount(e.target.value.length)} placeholder="Tell us about yourself..." className="w-full p-4 rounded-xl border border-gray-200 h-24 resize-none outline-none focus:border-primary transition-all"></textarea>
              <span className="absolute bottom-2 right-2 text-[10px] text-gray-400">{bioCount}/150</span>
            </div>
            <div className="space-y-6">
               <div className="flex flex-col gap-3">
                 <div>
                   <label className="text-sm font-bold text-primary block mb-1">I Can Teach</label>
                   <p className="text-[10px] text-gray-400 mb-2">Use commas to separate multiple skills</p>
                 </div>
                 <input type="text" value={canTeachInput} onChange={(e) => setCanTeachInput(e.target.value)} placeholder="e.g. React, Python" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-all" />
                 <div className="flex flex-wrap gap-2">
                   {popularSkills.map(s => (
                     <button key={s} type="button" onClick={() => setCanTeachInput(prev => prev ? `${prev}, ${s}` : s)} className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors text-gray-600">+ {s}</button>
                   ))}
                 </div>
               </div>
               <div className="flex flex-col gap-3">
                 <label className="text-sm font-bold text-accent">I Want To Learn</label>
                 <input type="text" value={wantLearnInput} onChange={(e) => setWantLearnInput(e.target.value)} placeholder="e.g. Photography, Guitar" className="p-4 rounded-xl border border-gray-200 outline-none focus:border-primary transition-all" />
                 <div className="flex flex-wrap gap-2">
                   {popularSkills.map(s => (
                     <button key={s} type="button" onClick={() => setWantLearnInput(prev => prev ? `${prev}, ${s}` : s)} className="text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors text-gray-600">+ {s}</button>
                   ))}
                 </div>
               </div>
            </div>
            <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 transform active:scale-[0.98] transition-all">Create Account</button>
          </form>
        </div>
      </div>
    );
  };

  function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:px-12 py-4">
        <div onClick={() => navigateTo('browse')} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
            <Users className="text-white" size={20} />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter text-primary">HunarHub</span>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="md:hidden p-2 text-primary hover:bg-gray-50 rounded-xl transition-all"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          <button onClick={() => navigateTo('browse')} className={`text-sm font-bold transition-colors ${currentPage === 'browse' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>Browse</button>
          <button onClick={() => navigateTo('open-projects')} className={`text-sm font-bold transition-colors ${currentPage === 'open-projects' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>Projects</button>
          <button onClick={() => navigateTo('requests')} className={`text-sm font-bold transition-colors ${currentPage === 'requests' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>Requests</button>
          <button onClick={() => navigateTo('profile')} className={`text-sm font-bold transition-colors ${currentPage === 'profile' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>Profile</button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[73px] left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-4 shadow-xl md:hidden"
            >
              <button onClick={() => { navigateTo('browse'); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${currentPage === 'browse' ? 'bg-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Search size={20} /> Browse Students
              </button>
              <button onClick={() => { navigateTo('open-projects'); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${currentPage === 'open-projects' ? 'bg-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                <BookOpen size={20} /> Open Projects
              </button>
              <button onClick={() => { navigateTo('requests'); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${currentPage === 'requests' ? 'bg-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                <MessageSquare size={20} /> Requests
              </button>
              <button onClick={() => { navigateTo('profile'); setIsMenuOpen(false); }} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${currentPage === 'profile' ? 'bg-primary text-white shadow-lg' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Users size={20} /> My Profile
              </button>
              <div className="h-[1px] bg-gray-100 my-2" />
              <button onClick={handleLogout} className="flex items-center gap-3 p-4 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={20} /> Sign Out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/10">
      <ToastProvider toasts={toasts} removeToast={removeToast} />
      
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-primary font-bold">Loading...</p>
        </div>
      )}

      {!['landing', 'login', 'signup'].includes(currentPage) && <Navbar />}
      
      <main className="pt-[73px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'landing' && <LandingPage />}
            {currentPage === 'login' && <LoginPage />}
            {currentPage === 'signup' && <SignUpPage />}
            {currentPage === 'browse' && (
              <BrowsePage 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                uniqueSkills={uniqueSkills}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                filteredUsers={filteredUsers}
                currentUser={currentUser}
                allRequests={allRequests}
                setTargetUser={setTargetUser}
                setRequestMessage={setRequestMessage}
                setIsRequestModalOpen={setIsRequestModalOpen}
                getMatchScore={getMatchScore}
                isSmartMatch={isSmartMatch}
                navigateTo={navigateTo}
              />
            )}
            {currentPage === 'requests' && <RequestsPage />}
            {currentPage === 'edit-profile' && <EditProfilePage />}
            {currentPage === 'profile' && currentUser && <ProfileView />}
            {currentPage === 'open-projects' && (
              <OpenProjectsPage 
                allProjects={allProjects}
                currentUser={currentUser}
                allUsers={allUsers}
                allRequests={allRequests}
                setTargetProject={setTargetProject}
                setRequestMessage={setRequestMessage}
                setRequestType={setRequestType}
                setIsRequestModalOpen={setIsRequestModalOpen}
                navigateTo={navigateTo}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title={requestType === 'project' ? `Apply to Join Project` : `Request from ${targetUser?.name}`}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Message</label>
            <textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 h-32 resize-none outline-none focus:bg-white"></textarea>
          </div>
          {requestType === 'project' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Portfolio Link (Optional)</label>
              <input 
                type="text" 
                value={portfolioLink} 
                onChange={(e) => setPortfolioLink(e.target.value)} 
                placeholder="https://github.com/yourusername"
                className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all"
              />
            </div>
          )}
          <button onClick={handleSendRequest} className="w-full mt-4 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-slate-800 transition-all">Send Request</button>
        </div>
      </Modal>

      <Modal isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} title="Rate Connection">
        <p className="text-sm text-gray-400 mb-6 text-center">How was your skill exchange session with this student?</p>
        <div className="flex justify-center gap-3 mb-8">
          {[1,2,3,4,5].map(s => (
            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              key={s}
              onClick={() => setRatingStars(s)}
              className="cursor-pointer"
            >
              <Star key={s} className={`w-10 h-10 ${s <= ratingStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
            </motion.div>
          ))}
        </div>
        <textarea value={ratingReview} onChange={(e) => setRatingReview(e.target.value)} placeholder="Write a short review about the session..." className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 h-32 resize-none outline-none focus:bg-white transition-all"></textarea>
        <button onClick={handleSubmitRating} className="w-full mt-6 py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-slate-800 transition-all">Submit Review</button>
      </Modal>
    </div>
  );

  function ProfileView() {
    const profileUser = viewedProfileId 
      ? allUsers.find(u => u.id === viewedProfileId) 
      : currentUser;

    if (!profileUser) return null;
    const isMyProfile = profileUser.id === currentUser?.id;
    const userProjects = allProjects.filter(p => p.ownerId === profileUser.id);

    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <Avatar name={profileUser.name} color={profileUser.avatarColor} url={profileUser.avatarUrl} size="lg" />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-display font-bold">{profileUser.name}</h1>
                  <p className="text-gray-500">{profileUser.college} • {profileUser.year}</p>
                </div>
                {isMyProfile && (
                  <button 
                    onClick={() => navigateTo('edit-profile')} 
                    className="flex items-center gap-2 px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-all"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                )}
              </div>
              <p className="text-gray-600 mb-6 max-w-2xl">{profileUser.bio || "No bio added yet."}</p>
              <div className="flex items-center gap-6 mb-6 justify-center md:justify-start">
                <div className="flex items-center gap-1 text-yellow-500 font-bold">
                  <Star fill="currentColor" size={20} />
                  <span className="text-xl">{profileUser.rating > 0 ? profileUser.rating.toFixed(1) : "New"}</span>
                </div>
                <div className="text-gray-400 text-sm">
                  <span className="font-bold text-gray-600">{profileUser.ratingCount}</span> Sessions Completed
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-primary mb-3 uppercase tracking-wider">Can Teach</p>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.canTeach.length > 0 ? profileUser.canTeach.map(s => (
                      <span key={s} className="bg-tag-bg text-tag-text px-4 py-1.5 rounded-full text-xs font-bold">{s}</span>
                    )) : <p className="text-xs text-gray-400">No skills listed</p>}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-accent mb-3 uppercase tracking-wider">Wants to Learn</p>
                  <div className="flex flex-wrap gap-2">
                    {profileUser.wantToLearn.length > 0 ? profileUser.wantToLearn.map(s => (
                      <span key={s} className="bg-orange-50 text-accent px-4 py-1.5 rounded-full text-xs font-bold border border-orange-100">{s}</span>
                    )) : <p className="text-xs text-gray-400">No skills listed</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Portfolio Section */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-display font-bold">Project Portfolio</h3>
            {isMyProfile && (
              <button 
                onClick={() => {
                  const title = prompt("Project Title");
                  const description = prompt("Description");
                  const techStack = prompt("Tech Stack (comma separated)");
                  const rolesNeeded = prompt("Roles Needed (comma separated)");
                  const githubUrl = prompt("GitHub Link (Optional)");
                  const liveUrl = prompt("Live Demo Link (Optional)");
                  
                  if (title && description && techStack) {
                    const newProject: Project = {
                      id: generateId(),
                      ownerId: profileUser.id,
                      title,
                      description,
                      techStack: techStack.split(',').map(s => s.trim()).filter(Boolean),
                      rolesNeeded: rolesNeeded ? rolesNeeded.split(',').map(s => s.trim()).filter(Boolean) : [],
                      githubUrl: githubUrl || undefined,
                      liveUrl: liveUrl || undefined,
                      createdAt: new Date().toISOString()
                    };
                    const updated = [newProject, ...allProjects];
                    saveProjects(updated);
                    setAllProjects(updated);
                  }
                }}
                className="flex items-center gap-2 text-primary hover:text-slate-800 font-bold text-sm transition-colors"
              >
                <Plus size={18} /> Add Project
              </button>
            )}
          </div>

          {userProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-50 rounded-2xl">
              <p>No projects showcased yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {userProjects.map(project => (
                <div key={project.id} className="group p-5 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all relative">
                  {isMyProfile && (
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <h4 className="font-bold text-primary mb-2 pr-8">{project.title}</h4>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.slice(0, 3).map(tech => (
                      <span key={tech} className="bg-gray-50 text-[10px] px-2 py-0.5 rounded font-bold text-gray-400 capitalize">{tech}</span>
                    ))}
                    {project.techStack.length > 3 && <span className="text-[10px] text-gray-300 font-bold self-center">+{project.techStack.length - 3}</span>}
                  </div>
                  <div className="flex gap-3">
                    {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors"><Github size={16} /></a>}
                    {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors"><ExternalLink size={16} /></a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-xl font-display font-bold mb-6">Recent Reviews</h3>
          {allRatings.filter(r => r.toUserId === profileUser.id).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No reviews yet. {isMyProfile ? "Start exchanging skills to get rated!" : "Be the first to rate their session!"}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {allRatings.filter(r => r.toUserId === profileUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(rating => {
                const reviewer = allUsers.find(u => u.id === rating.fromUserId);
                return (
                  <div key={rating.id} className="border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={reviewer?.name || "?"} color={reviewer?.avatarColor} url={reviewer?.avatarUrl} size="sm" />
                        <div>
                          <p className="font-bold text-sm">{reviewer?.name || "Deleted User"}</p>
                          <p className="text-[10px] text-gray-400">{new Date(rating.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} className={s <= rating.stars ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{rating.review}"</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  function RequestsPage() {
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
    const received = allRequests.filter(r => r.receiverId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sent = allRequests.filter(r => r.senderId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeList = activeTab === 'received' ? received : sent;

    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <h1 className="text-3xl font-display font-bold">My Requests</h1>
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('received')}
              className={`flex-1 md:px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'received' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Received {received.length > 0 && <span className="ml-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">{received.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('sent')}
              className={`flex-1 md:px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'sent' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Sent {sent.length > 0 && <span className="ml-1 bg-gray-400 text-white text-[10px] px-1.5 py-0.5 rounded-full">{sent.length}</span>}
            </button>
          </div>
        </div>

        {activeList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="text-gray-300" size={32} />
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-800 mb-2">No requests yet</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              {activeTab === 'received' ? "When students want to learn from you, their requests will appear here." : "Start browsing students and send a request to exchange skills!"}
            </p>
            {activeTab === 'sent' && (
              <button 
                onClick={() => navigateTo('browse')}
                className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
              >
                Browse Students
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activeList.map(r => {
              const otherUser = allUsers.find(u => u.id === (activeTab === 'received' ? r.senderId : r.receiverId));
              return (
                <div key={r.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="flex gap-4 items-center flex-1">
                    <Avatar name={otherUser?.name || '?'} color={otherUser?.avatarColor} url={otherUser?.avatarUrl} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{otherUser?.name || "Deleted User"}</p>
                        <div className="flex gap-1">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            r.status === 'accepted' ? 'bg-green-50 text-green-600' :
                            r.status === 'declined' ? 'bg-red-50 text-red-600' :
                            'bg-yellow-50 text-yellow-600'
                          }`}>
                            {r.status}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            r.type === 'project' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {r.type}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">"{r.message}"</p>
                      {r.portfolioLink && (
                        <a 
                          href={r.portfolioLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:underline mt-2"
                        >
                          <ExternalLink size={10} /> View Portfolio
                        </a>
                      )}
                      <p className="text-[10px] text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-center justify-end">
                    {activeTab === 'received' && r.status === 'pending' && (
                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => handleUpdateRequestStatus(r.id, 'accepted')} 
                          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20"
                        >
                          <Check size={18} /> Accept
                        </button>
                        <button 
                          onClick={() => handleUpdateRequestStatus(r.id, 'declined')} 
                          className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-2 bg-white text-red-500 border border-red-100 rounded-xl font-bold hover:bg-red-50 transition-all font-bold"
                        >
                          <X size={18} /> Decline
                        </button>
                      </div>
                    )}

                    {r.status === 'accepted' && (
                      <div className="w-full md:w-auto">
                         {allRatings.some(rating => rating.requestId === r.id && rating.fromUserId === currentUser?.id) ? (
                           <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-4 py-2 rounded-xl font-bold border border-yellow-100">
                             <Star size={16} fill="currentColor" /> Rated ⭐
                           </div>
                         ) : (
                           <button 
                            onClick={() => { setTargetRequest(r); setIsRatingModalOpen(true); }}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-accent/20"
                           >
                            <Star size={18} /> Rate Partner
                           </button>
                         )}
                      </div>
                    )}

                    {activeTab === 'sent' && r.status === 'pending' && (
                      <div className="text-xs font-bold text-gray-400 italic px-4 py-2 bg-gray-50 rounded-lg">
                        Waiting for response...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function EditProfilePage() {
    const [canTeachInput, setCanTeachInput] = useState(currentUser?.canTeach.join(', ') || '');
    const [wantLearnInput, setWantLearnInput] = useState(currentUser?.wantToLearn.join(', ') || '');
    const [bioCount, setBioCount] = useState(currentUser?.bio.length || 0);
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser?.avatarUrl);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          showToast('Image size should be less than 2MB', 'error');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!currentUser) return;

      const formData = new FormData(e.currentTarget);
      const updatedUser: User = {
        ...currentUser,
        name: formData.get('name') as string,
        college: formData.get('college') as string,
        year: formData.get('year') as string,
        branch: formData.get('branch') as string,
        bio: formData.get('bio') as string,
        avatarUrl,
        canTeach: canTeachInput.split(',').map(s => s.trim()).filter(Boolean),
        wantToLearn: wantLearnInput.split(',').map(s => s.trim()).filter(Boolean),
      };

      const updatedUsers = allUsers.map(u => u.id === currentUser.id ? updatedUser : u);
      saveUsers(updatedUsers);
      setAllUsers(updatedUsers);
      setLocalCurrentUser(updatedUser);
      navigateTo('profile');
      showToast('Profile updated successfully!', 'success');
    };

    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <button onClick={() => navigateTo('profile')} className="flex items-center gap-2 text-gray-400 hover:text-primary mb-8 font-bold transition-colors">
          <ChevronLeft size={20} /> Back to Profile
        </button>
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <h1 className="text-3xl font-display font-bold text-primary mb-8">Edit Profile</h1>
          
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <Avatar name={currentUser?.name || "?"} url={avatarUrl} color={currentUser?.avatarColor} size="xl" className="border-4 border-gray-50 shadow-inner" />
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-slate-800 transition-all border-4 border-white">
                <Edit2 size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Update Photo</p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <input name="name" type="text" defaultValue={currentUser?.name} required className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">College</label>
                <input name="college" type="text" defaultValue={currentUser?.college} required className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Year</label>
                <select name="year" defaultValue={currentUser?.year} className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all">
                  <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Branch</label>
                <select name="branch" defaultValue={currentUser?.branch} className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all">
                  <option>CSE</option><option>ECE</option><option>ME</option><option>Civil</option><option>EEE</option><option>IT</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2 relative">
              <label className="text-xs font-bold text-gray-400 uppercase">Your Bio</label>
              <textarea 
                name="bio" 
                maxLength={150} 
                defaultValue={currentUser?.bio}
                onChange={(e) => setBioCount(e.target.value.length)}
                className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all h-32 resize-none"
              ></textarea>
              <span className="absolute bottom-4 right-4 text-[10px] text-gray-300 font-bold">{bioCount}/150</span>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">I Can Teach</label>
                <input 
                  type="text" 
                  value={canTeachInput} 
                  onChange={(e) => setCanTeachInput(e.target.value)} 
                  placeholder="e.g. React, JavaScript" 
                  className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-accent uppercase">I Want To Learn</label>
                <input 
                  type="text" 
                  value={wantLearnInput} 
                  onChange={(e) => setWantLearnInput(e.target.value)} 
                  placeholder="e.g. Python, Figma" 
                  className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary outline-none transition-all" 
                />
              </div>
            </div>
            <div className="flex gap-4 pt-6">
              <button onClick={() => navigateTo('profile')} type="button" className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
              <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-slate-800 transition-all">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

