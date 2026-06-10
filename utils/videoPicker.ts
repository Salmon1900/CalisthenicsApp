// Picks or records a video via expo-image-picker, handling permissions.
// Returns the local file URI, or null if the user cancelled or denied access.

import * as ImagePicker from 'expo-image-picker';

export type VideoSource = 'camera' | 'library';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['videos'],
  allowsEditing: false,
  quality: 1,
};

async function ensurePermission(source: VideoSource): Promise<boolean> {
  const { granted } =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  return granted;
}

export interface PickVideoResult {
  status: 'picked' | 'cancelled' | 'denied';
  uri?: string;
}

export async function pickVideo(source: VideoSource): Promise<PickVideoResult> {
  if (!(await ensurePermission(source))) {
    return { status: 'denied' };
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);

  if (result.canceled || result.assets.length === 0) {
    return { status: 'cancelled' };
  }
  return { status: 'picked', uri: result.assets[0].uri };
}
