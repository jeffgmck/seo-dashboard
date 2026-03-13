import { NextResponse } from 'next/server';
import { getClientSettings, getGapAnalysis, saveGapAnalysis, addActivityLog } from '@/lib/storage';
import { GapAnalysisResult } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json(getGapAnalysis(id));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { pages } = await request.json();
  const clientSettings = getClientSettings(id);

  const assignedServices = new Set(pages?.map((p: { assignedService: string }) => p.assignedService).filter(Boolean) || []);
  const assignedCategories = new Set(pages?.map((p: { assignedCategory: string }) => p.assignedCategory).filter(Boolean) || []);

  const missingServices = clientSettings.gbpServices
    .map(s => s.name)
    .filter(name => !assignedServices.has(name));

  const allCategories = [clientSettings.gbpPrimaryCategory, ...clientSettings.gbpSecondaryCategories].filter(Boolean);
  const missingCategories = allCategories.filter(cat => !assignedCategories.has(cat));

  const contentPlan = missingServices.map(service => {
    const svc = clientSettings.gbpServices.find(s => s.name === service);
    return {
      service,
      category: svc?.category || clientSettings.gbpPrimaryCategory,
      targetKeyword: `${service} ${clientSettings.city}`,
      priority: 'high' as const,
      status: 'planned' as const,
    };
  });

  const result: GapAnalysisResult = {
    clientId: id,
    missingServices,
    missingCategories,
    contentPlan,
    createdAt: new Date().toISOString(),
  };

  saveGapAnalysis(result);
  addActivityLog({
    action: 'Gap Analysis Complete',
    details: `Found ${missingServices.length} missing service pages, ${missingCategories.length} missing category pages`,
    clientId: id,
    status: 'success',
  });

  return NextResponse.json(result);
}
