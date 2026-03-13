import fs from 'fs';
import path from 'path';
import { AppSettings, Client, ClientSettings, GeneratedContent, CrawlResult, GBPAuditResult, GapAnalysisResult, ActivityLogEntry } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJSON<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // Return fallback on error
  }
  return fallback;
}

function writeJSON(filePath: string, data: unknown) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// App Settings
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
  openaiApiKey: '',
  anthropicApiKey: '',
  youtubeApiKey: '',
  defaultModel: 'openai',
};

export function getSettings(): AppSettings {
  return readJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings) {
  writeJSON(SETTINGS_FILE, settings);
}

// Clients
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

export function getClients(): Client[] {
  return readJSON(CLIENTS_FILE, []);
}

export function getClient(id: string): Client | undefined {
  return getClients().find(c => c.id === id);
}

export function saveClient(client: Client) {
  const clients = getClients();
  const idx = clients.findIndex(c => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = client;
  } else {
    clients.push(client);
  }
  writeJSON(CLIENTS_FILE, clients);
}

export function deleteClient(id: string) {
  const clients = getClients().filter(c => c.id !== id);
  writeJSON(CLIENTS_FILE, clients);
  // Also clean up client-specific data
  const clientDir = path.join(DATA_DIR, 'clients', id);
  if (fs.existsSync(clientDir)) {
    fs.rmSync(clientDir, { recursive: true });
  }
}

// Client Settings
function clientSettingsFile(clientId: string) {
  return path.join(DATA_DIR, 'clients', clientId, 'settings.json');
}

const DEFAULT_CLIENT_SETTINGS = (clientId: string): ClientSettings => ({
  clientId,
  businessName: '',
  businessPhone: '',
  businessEmail: '',
  businessAddress: '',
  city: '',
  state: '',
  zip: '',
  website: '',
  gbpRawData: '',
  gbpPrimaryCategory: '',
  gbpSecondaryCategories: [],
  gbpServices: [],
  voiceTone: '',
  wordsToUse: [],
  wordsToAvoid: [],
  targetAudience: '',
  writingSamples: '',
  averageRating: 0,
  reviewCount: 0,
  reviewSourceUrl: '',
  localDetails: '',
  imageStylePreference: '',
  wpSiteUrl: '',
  wpUsername: '',
  wpAppPassword: '',
});

export function getClientSettings(clientId: string): ClientSettings {
  return readJSON(clientSettingsFile(clientId), DEFAULT_CLIENT_SETTINGS(clientId));
}

export function saveClientSettings(settings: ClientSettings) {
  writeJSON(clientSettingsFile(settings.clientId), settings);
}

// GBP Audit
function gbpAuditFile(clientId: string) {
  return path.join(DATA_DIR, 'clients', clientId, 'gbp-audit.json');
}

export function getGBPAudit(clientId: string): GBPAuditResult | null {
  return readJSON(gbpAuditFile(clientId), null);
}

export function saveGBPAudit(audit: GBPAuditResult) {
  writeJSON(gbpAuditFile(audit.clientId), audit);
}

// Crawl Results
function crawlFile(clientId: string) {
  return path.join(DATA_DIR, 'clients', clientId, 'crawl.json');
}

export function getCrawlResult(clientId: string): CrawlResult | null {
  return readJSON(crawlFile(clientId), null);
}

export function saveCrawlResult(result: CrawlResult) {
  writeJSON(crawlFile(result.clientId), result);
}

// Gap Analysis
function gapAnalysisFile(clientId: string) {
  return path.join(DATA_DIR, 'clients', clientId, 'gap-analysis.json');
}

export function getGapAnalysis(clientId: string): GapAnalysisResult | null {
  return readJSON(gapAnalysisFile(clientId), null);
}

export function saveGapAnalysis(result: GapAnalysisResult) {
  writeJSON(gapAnalysisFile(result.clientId), result);
}

// Generated Content
function contentDir(clientId: string) {
  return path.join(DATA_DIR, 'clients', clientId, 'content');
}

export function getGeneratedContent(clientId: string): GeneratedContent[] {
  const dir = contentDir(clientId);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => readJSON<GeneratedContent>(path.join(dir, f), null as unknown as GeneratedContent))
    .filter(Boolean);
}

export function getContentById(clientId: string, contentId: string): GeneratedContent | null {
  const file = path.join(contentDir(clientId), `${contentId}.json`);
  return readJSON(file, null);
}

export function saveGeneratedContent(content: GeneratedContent) {
  writeJSON(path.join(contentDir(content.clientId), `${content.id}.json`), content);
}

// Activity Log
const ACTIVITY_LOG_FILE = path.join(DATA_DIR, 'activity-log.json');

export function getActivityLog(limit = 50): ActivityLogEntry[] {
  const log = readJSON<ActivityLogEntry[]>(ACTIVITY_LOG_FILE, []);
  return log.slice(-limit);
}

export function addActivityLog(entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) {
  const log = readJSON<ActivityLogEntry[]>(ACTIVITY_LOG_FILE, []);
  log.push({
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  // Keep last 500 entries
  if (log.length > 500) {
    log.splice(0, log.length - 500);
  }
  writeJSON(ACTIVITY_LOG_FILE, log);
}
