// src/components/Dashboard/AICostTracker.tsx
import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, BarChart2 } from 'lucide-react';
import { CostTracker } from '../../services/ai/config';

interface ModelBreakdown {
  'gpt-3.5-turbo': number;
  'gpt-4o-mini': number;
  'gpt-4-0125-preview': number;
}

export function AICostTracker() {
  const [dailyCost, setDailyCost] = useState(0);
  const [queryCount, setQueryCount] = useState(0);
  const [modelBreakdown, setModelBreakdown] = useState<ModelBreakdown>({
    'gpt-3.5-turbo': 0,
    'gpt-4o-mini': 0,
    'gpt-4-0125-preview': 0
  });
  
  const costTracker = CostTracker.getInstance();

  useEffect(() => {
    // Initial load
    updateStats();

    // Update cost display every 10 seconds
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    setDailyCost(costTracker.getDailyCost());
    
    // Get query count from localStorage
    const today = new Date().toDateString();
    const storedCount = parseInt(localStorage.getItem(`ai-query-count-${today}`) || '0');
    setQueryCount(storedCount);
    
    // Get model breakdown
    const breakdown = costTracker.getModelBreakdown();
    setModelBreakdown(breakdown as ModelBreakdown);
  };

  const costPercentage = (dailyCost / 20) * 100; // $20 daily budget
  const avgCostPerQuery = queryCount > 0 ? dailyCost / queryCount : 0;
  
  const getCostStatus = () => {
    if (costPercentage < 50) return { color: 'text-success-500', bg: 'bg-success-500/10', icon: '✅' };
    if (costPercentage < 75) return { color: 'text-warning-500', bg: 'bg-warning-500/10', icon: '⚠️' };
    return { color: 'text-error-500', bg: 'bg-error-500/10', icon: '🚨' };
  };

  const status = getCostStatus();

  return (
    <div className="bg-dark-100 border border-dark-300 rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary-500" />
          <h3 className="text-body-lg text-primary">AI Usage Today</h3>
        </div>
        <span className={`text-sm ${status.color}`}>{status.icon}</span>
      </div>

      {/* Cost Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-caption mb-1">
          <span>Daily Cost</span>
          <span className={status.color}>${dailyCost.toFixed(2)} / $20.00</span>
        </div>
        <div className="w-full bg-dark-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              costPercentage < 50 ? 'bg-success-500' :
              costPercentage < 75 ? 'bg-warning-500' : 'bg-error-500'
            }`}
            style={{ width: `${Math.min(costPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-caption mb-4">
        <div>
          <p className="text-muted mb-1">Queries Today</p>
          <p className="text-body text-primary">{queryCount}</p>
        </div>
        <div>
          <p className="text-muted mb-1">Avg Cost/Query</p>
          <p className="text-body text-primary">${avgCostPerQuery.toFixed(3)}</p>
        </div>
      </div>

      {/* Model Usage Breakdown */}
      <div className="mb-4">
        <p className="text-caption text-muted mb-2 flex items-center gap-2">
          <BarChart2 className="w-3 h-3" />
          Model Usage
        </p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-caption">
            <span className="text-muted">GPT-3.5 (Simple)</span>
            <span className="text-primary">{modelBreakdown['gpt-3.5-turbo']}%</span>
          </div>
          <div className="flex items-center justify-between text-caption">
            <span className="text-muted">GPT-4 Mini</span>
            <span className="text-primary">{modelBreakdown['gpt-4o-mini']}%</span>
          </div>
          <div className="flex items-center justify-between text-caption">
            <span className="text-muted">GPT-4 (Complex)</span>
            <span className="text-primary">{modelBreakdown['gpt-4-0125-preview']}%</span>
          </div>
        </div>
      </div>

      {/* Warning if approaching limit */}
      {costPercentage > 75 && (
        <div className={`mt-4 p-3 ${status.bg} border border-warning-500/30 rounded-lg`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning-500" />
            <p className="text-caption text-warning-500">
              Approaching daily budget limit. Consider enabling economy mode.
            </p>
          </div>
        </div>
      )}

      {/* Savings tip */}
      <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg">
        <p className="text-caption text-primary-500">
          💡 Tip: {avgCostPerQuery > 0.01 ? 
            'Enable smart caching to reduce costs' : 
            'Great job keeping costs low!'
          }
        </p>
      </div>
    </div>
  );
}