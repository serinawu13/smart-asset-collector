'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import api from '@/lib/api';

type JobStatus = 'idle' | 'running' | 'completed' | 'failed';

interface JobResult {
  listings_scraped: number;
  listings_normalized: number;
  listings_inserted: number;
  listings_updated: number;
  catalog_created: number;
  catalog_updated: number;
}

interface JobState {
  jobId: string | null;
  status: JobStatus;
  result: JobResult | null;
  error: string | null;
  elapsed: number;
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function AdminPage() {
  const [job, setJob] = useState<JobState>({
    jobId: null,
    status: 'idle',
    result: null,
    error: null,
    elapsed: 0,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const stopTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    timeoutRef.current = null;
    timerRef.current = null;
  }, []);

  useEffect(() => () => stopTimers(), [stopTimers]);

  const scheduleNextPoll = useCallback(
    (jobId: string) => {
      // Adaptive: every 10s for first 60s, then every 30s
      const delay = elapsedRef.current < 60 ? 10_000 : 30_000;

      timeoutRef.current = setTimeout(async () => {
        try {
          const data = await api.getHermesRefreshStatus(jobId);
          const isDone = data.status === 'completed' || data.status === 'failed';

          setJob(prev => ({
            ...prev,
            status: data.status as JobStatus,
            result: data.result ?? null,
            error: data.error ?? null,
          }));

          if (isDone || elapsedRef.current >= 900) {
            stopTimers();
          } else {
            scheduleNextPoll(jobId);
          }
        } catch {
          // network hiccup — retry same interval
          if (elapsedRef.current < 900) scheduleNextPoll(jobId);
        }
      }, delay);
    },
    [stopTimers]
  );

  const handleRefresh = async () => {
    stopTimers();
    elapsedRef.current = 0;

    setJob({ jobId: null, status: 'running', result: null, error: null, elapsed: 0 });

    try {
      const { job_id } = await api.startHermesRefresh();

      setJob(prev => ({ ...prev, jobId: job_id }));

      // Elapsed-second ticker
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setJob(prev => ({ ...prev, elapsed: elapsedRef.current }));
      }, 1000);

      scheduleNextPoll(job_id);
    } catch (err: any) {
      setJob({
        jobId: null,
        status: 'failed',
        result: null,
        error: err?.message ?? 'Failed to start scrape',
        elapsed: 0,
      });
    }
  };

  const isRunning = job.status === 'running';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-1">
          Smart Asset Collector
        </p>
        <h1 className="text-3xl font-serif mb-10">Admin Panel</h1>

        {/* Card */}
        <div className="border border-neutral-800 rounded-xl p-6 bg-[#111]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium mb-1">Hermès Data Refresh</h2>
              <p className="text-sm text-neutral-400">
                Scrapes Vestiaire Collective for Birkin + Kelly listings, stores raw data,
                and updates the catalog with real market prices.
              </p>
            </div>
            <span className="text-xs text-neutral-500 mt-1 whitespace-nowrap ml-4">
              ~60–120 sec
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRunning}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isRunning
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-white text-black hover:bg-neutral-200 active:scale-95'
            }`}
          >
            {isRunning ? 'Fetching…' : 'Fetch Hermès Data'}
          </button>

          {/* Status row */}
          {job.status !== 'idle' && (
            <div className="mt-5 pt-5 border-t border-neutral-800">
              <div className="flex items-center gap-3 mb-4">
                {isRunning && (
                  <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                )}
                {job.status === 'completed' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                )}
                {job.status === 'failed' && (
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                )}
                <span className="text-sm text-neutral-300 capitalize">
                  {isRunning
                    ? `Running — ${formatElapsed(job.elapsed)} elapsed`
                    : job.status}
                </span>
                {isRunning && (
                  <span className="text-xs text-neutral-600 ml-auto">
                    polling every {elapsedRef.current < 60 ? '10' : '30'}s
                  </span>
                )}
              </div>

              {/* Results */}
              {job.status === 'completed' && job.result && (
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Listings scraped" value={job.result.listings_scraped} />
                  <Stat label="Listings stored" value={`${job.result.listings_inserted} new · ${job.result.listings_updated} updated`} />
                  <Stat label="Catalog created" value={job.result.catalog_created} />
                  <Stat label="Catalog updated" value={job.result.catalog_updated} />
                </div>
              )}

              {/* Error */}
              {job.status === 'failed' && job.error && (
                <p className="text-sm text-red-400 font-mono bg-red-950/30 rounded px-3 py-2">
                  {job.error}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-neutral-700 mt-6 text-center">
          /admin — internal only
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-neutral-900 rounded-lg px-4 py-3">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
