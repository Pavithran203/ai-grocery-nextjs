import * as Haptics from 'expo-haptics';

export const triggerLight = () => {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch(e){}
};

export const triggerMedium = () => {
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e){}
};

export const triggerSuccess = () => {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e){}
};

export const triggerError = () => {
  try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch(e){}
};
