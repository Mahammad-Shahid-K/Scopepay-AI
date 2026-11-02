import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Search, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';
import { Project } from '../types';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      (p.client_name && p.client_name.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E5E7EB] dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111827] dark:text-gray-100">Projects</h1>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">
            Manage your client deliverables, scope versions, quotations, and payments.
          </p>
        </div>
        <div>
          <Link to="/create-project">
            <Button icon={<Plus className="w-4 h-4" />}>
              + Create New Project
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* Filter / Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9CA3AF] dark:text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by project name or client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#1A2234] text-[#111827] dark:text-gray-100 border border-[#E5E7EB] dark:border-gray-700 rounded-md focus:ring-1 focus:ring-red-500 focus:border-[#DC2626] dark:focus:border-red-500 placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B7280] dark:text-gray-400">Status:</span>
            {['all', 'draft', 'proposed', 'approved', 'in_progress'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-[#FEF2F2] dark:bg-red-950/40 text-[#DC2626] dark:text-red-400 font-bold border border-red-200 dark:border-red-900/50'
                    : 'text-[#6B7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-white hover:bg-[#F9FAFB] dark:hover:bg-gray-800'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-xs text-[#6B7280] dark:text-gray-400">Loading projects...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<FolderKanban className="w-6 h-6" />}
                title="No projects found"
                description="Start by creating a new project with AI Scope Generation."
                actionText="+ Create Project"
                onAction={() => navigate('/create-project')}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-[#161F30] text-[#6B7280] dark:text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-6">Project Title</th>
                    <th className="py-3 px-6">Client</th>
                    <th className="py-3 px-6">Budget</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Created</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB] dark:divide-gray-800">
                  {filtered.map(proj => (
                    <tr
                      key={proj.id}
                      className="hover:bg-[#F9FAFB] dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/projects/${proj.id}`)}
                    >
                      <td className="py-4 px-6 font-semibold text-[#111827] dark:text-gray-100">
                        <span className="group-hover:text-[#DC2626] dark:group-hover:text-red-400 transition-colors">{proj.title}</span>
                      </td>
                      <td className="py-4 px-6 text-[#6B7280] dark:text-gray-400">
                        {proj.client_name || 'Direct Client'}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#111827] dark:text-gray-100">
                        ${proj.budget.toLocaleString()} {proj.currency}
                      </td>
                      <td className="py-4 px-6">
                        <Badge status={proj.status} />
                      </td>
                      <td className="py-4 px-6 text-[#6B7280] dark:text-gray-400">
                        {new Date(proj.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/projects/${proj.id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[#DC2626] dark:text-red-400 hover:text-[#B91C1C] dark:hover:text-red-300 font-semibold inline-flex items-center gap-1"
                        >
                          Workspace <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
