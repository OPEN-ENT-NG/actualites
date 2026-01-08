import { ViewsModal, ViewsModalProps } from '@edifice.io/react/audience';
import { InfoId } from '~/models/info';
import { useInfoViewsDetails } from '~/services/queries';

export type AudienceModalProps = Omit<
  ViewsModalProps,
  'viewsDetails' | 'isOpen'
> & {
  infoId: InfoId;
};

export const AudienceModal = ({
  infoId,
  ...otherProps
}: AudienceModalProps) => {
  const { data } = useInfoViewsDetails(infoId);

  return data ? (
    <ViewsModal {...otherProps} isOpen viewsDetails={data} />
  ) : null;
};
