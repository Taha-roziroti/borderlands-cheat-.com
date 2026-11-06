import type { IconName } from '../components/icons/types';

export const featureIcons: Record<string, IconName> = {
  'Precision soft aim': 'featureAimbot',
  'Enemy ESP & bosses': 'featureEsp',
  'Loot ESP & radar': 'featureRadar',
  'Gunfeel controls': 'stepCrosshair',
  'Stream-proof overlay': 'streamProof',
  'Profiles & Cloud DMA': 'compareCloudBackup',
};

export const whyUsIcons: IconName[] = ['whyShield', 'whyUsers', 'whyMonitor', 'whyHeadphones'];

export const setupStepIcons: IconName[] = ['acqPackage', 'acqSettings', 'acqCheck'];

export const toolkitIcons: Record<string, IconName> = {
  Aim: 'featureAimbot',
  ESP: 'featureEsp',
  Loot: 'featureRadar',
  Radar: 'featureRadar',
  Gunfeel: 'stepCrosshair',
  Capture: 'streamProof',
};

export const workflowIcons: IconName[] = [
  'workflowAlert',
  'workflowPackage',
  'workflowSettings',
  'workflowCheck',
];

export const fieldNoteIcons: IconName[] = ['fieldCalendar', 'fieldShield', 'fieldHeadphones'];

export const blogTagIcons: Record<string, IconName> = {};

export const heroStatusPills: { icon: IconName; label: string }[] = [
  { icon: 'softAim', label: 'Soft aim' },
  { icon: 'featureEsp', label: 'Enemy ESP' },
  { icon: 'lootEsp', label: 'Loot ESP' },
  { icon: 'uavRadar', label: 'Radar' },
  { icon: 'streamProof', label: 'Stream proof' },
  { icon: 'compareCloudBackup', label: 'Cloud DMA' },
  { icon: 'settings', label: 'Profiles' },
];

export const heroStatIcons: IconName[] = [
  'heroStatStream',
  'heroStatClock',
  'heroStatUsers',
  'heroStatHeadphones',
];

/** Matches `t.compatibility.items` order on the homepage. */
export const compatibilityIcons: IconName[] = [
  'whyMonitor',
  'layers',
  'stepCrosshair',
  'compareCloudBackup',
  'fieldShield',
  'settings',
  'heroStatStream',
];

export const cheatTierIcons: Record<string, IconName> = {};

export const productCategoryIcons: Record<string, IconName> = {};
