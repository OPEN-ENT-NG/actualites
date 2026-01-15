import { InfoDetailsFormParams } from '~/store/infoFormStore';

export const isContentValid = (content?: string): boolean => {
  return !!(content && content.trim() !== '' && content.trim() !== '<p></p>');
};

export const isInfoDetailsValid = (
  infoDetails: Partial<InfoDetailsFormParams>,
): boolean => {
  return !!(
    infoDetails.title?.trim() !== '' &&
    isContentValid(infoDetails.content) &&
    infoDetails.thread_id !== undefined
  );
};
