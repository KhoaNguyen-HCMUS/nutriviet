import { requestAuth } from '../utils/api';

export interface ProfileResponse {
  success: boolean;
  data: {
    user?: {
      id: string;
      email: string;
      created_at: string;
    };
    profile: {
      age?: string;
      height_cm: string;
      weight_kg: string;
      sex: string;
      activity_level: string;
      goal: string;
      bmi: string;
      bmr: string;
      tdee: string;
      updated_at: string;
      conditions_json?: string;
      allergies_json?: string;
      preferences_json?: string;
      consent_accepted_at?: string | null;
    };
  };
}

export interface ProfileUpdateRequest {
  age: number;
  height_cm: number;
  weight_kg: number;
  sex: string;
  activity_level: string;
  goal: string;
  conditions_json?: string;
  allergies_json?: string;
  preferences_json?: string;
}

// Define a more flexible API response type for handling different response formats
interface FlexibleProfileResponse {
  success?: boolean;
  data?: {
    user?: {
      id?: string;
      email?: string;
      created_at?: string;
    };
    profile?: {
      age?: string | number;
      height_cm?: string;
      weight_kg?: string;
      sex?: string;
      activity_level?: string;
      goal?: string;
      bmi?: string;
      bmr?: string;
      tdee?: string;
      updated_at?: string;
      conditions_json?: string;
      allergies_json?: string;
      preferences_json?: string;
      consent_accepted_at?: string | null;
    };
    // For direct properties in data (flat structure)
    age?: string | number;
    height_cm?: string;
    weight_kg?: string;
    sex?: string;
    activity_level?: string;
    goal?: string;
    bmi?: string;
    bmr?: string;
    tdee?: string;
    updated_at?: string;
    conditions_json?: string;
    allergies_json?: string;
    preferences_json?: string;
    consent_accepted_at?: string | null;
  };
}

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    const response = await requestAuth<FlexibleProfileResponse>('GET', '/api/profile');
    console.log('Raw profile response:', response);

    // Nutrition profile endpoint returns the profile object directly or null
    const flat = response as unknown as FlexibleProfileResponse;
    const dataObj = flat && (flat as any);

    const profileFlat = dataObj && (dataObj.data || dataObj);
    if (!profileFlat) throw new Error('No profile data');

    const conditionsVal = (profileFlat.conditions_json ?? []) as unknown;
    const allergiesVal = (profileFlat.allergies_json ?? []) as unknown;
    const preferencesVal = (profileFlat.preferences_json ?? []) as unknown;

    const toJsonString = (v: unknown) => {
      if (typeof v === 'string') return v;
      try {
        return JSON.stringify(v ?? []);
      } catch {
        return '[]';
      }
    };

    return {
      success: true,
      data: {
        profile: {
          age: profileFlat.age != null ? String(profileFlat.age) : undefined,
          height_cm: profileFlat.height_cm || '0',
          weight_kg: profileFlat.weight_kg || '0',
          sex: profileFlat.sex || 'male',
          activity_level: profileFlat.activity_level || 'moderate',
          goal: profileFlat.goal || 'maintain',
          bmi: profileFlat.bmi || '0',
          bmr: profileFlat.bmr || '0',
          tdee: profileFlat.tdee || '0',
          updated_at: profileFlat.updated_at || new Date().toISOString(),
          conditions_json: toJsonString(conditionsVal),
          allergies_json: toJsonString(allergiesVal),
          preferences_json: toJsonString(preferencesVal),
          consent_accepted_at: profileFlat.consent_accepted_at ?? null,
        },
      },
    };
  } catch (error) {
    console.error('Error in getProfile service:', error);
    throw error;
  }
};

export const updateProfile = async (profileData: ProfileUpdateRequest): Promise<ProfileResponse> => {
  try {
    const response = await requestAuth<any, ProfileUpdateRequest>('PUT', '/api/profile', profileData);
    const apiProfile = response?.profile || response?.data?.profile || response;
    if (!apiProfile) throw new Error('Invalid update response');
    return {
      success: true,
      data: {
        profile: {
          age: String(profileData.age),
          height_cm: String(apiProfile.height_cm ?? profileData.height_cm),
          weight_kg: String(apiProfile.weight_kg ?? profileData.weight_kg),
          sex: String(apiProfile.sex ?? profileData.sex),
          activity_level: String(apiProfile.activity_level ?? profileData.activity_level),
          goal: String(apiProfile.goal ?? profileData.goal),
          bmi: String(apiProfile.bmi ?? '0'),
          bmr: String(apiProfile.bmr ?? '0'),
          tdee: String(apiProfile.tdee ?? '0'),
          updated_at: apiProfile.updated_at || new Date().toISOString(),
          conditions_json: profileData.conditions_json || '[]',
          allergies_json: profileData.allergies_json || '[]',
          preferences_json: profileData.preferences_json || '[]',
          consent_accepted_at: apiProfile.consent_accepted_at ?? null,
        },
      },
    };
  } catch (error) {
    console.error('Error in updateProfile service:', error);
    throw error;
  }
};
