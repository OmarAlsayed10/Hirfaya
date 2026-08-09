import { useSelector } from 'react-redux';
import { useTemplate } from '../../../hooks/useTemplate';
import ClassicCV from '../../../templates/classic-cv';
import LinkedInCV from '../../../templates/linkedin-cv';
import ModernCV from '../../../templates/modern-cv';
import JakeCV from '../../../templates/jake-cv';
import HarvardCV from '../../../templates/harvard-cv';
import PhotoCV from '../../../templates/photo-cv';
import type { RootState } from '../../../redux/store/store';
import { cvFormToPdfProps } from '../../../templates/pdf/cvFormToPdfProps';

const Preview = ({ activePage = 1 }: { activePage?: number }) => {
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const sectionOrder = useSelector((state: RootState) => state.cvBuilder.sectionOrder);
  const { choosenTemp } = useTemplate();

  const commonProps = { ...cvFormToPdfProps(formData), sectionOrder };

  return (
    <>
      {choosenTemp === 'jake-cv' && <JakeCV {...commonProps} activePage={activePage} />}
      {choosenTemp === 'harvard-cv' && <HarvardCV {...commonProps} activePage={activePage} />}
      {choosenTemp === 'photo-cv' && <PhotoCV {...commonProps} activePage={activePage} />}
      {choosenTemp === 'classic-cv' && <ClassicCV {...commonProps} activePage={activePage} />}
      {choosenTemp === 'linkedin-cv' && <LinkedInCV {...commonProps} activePage={activePage} />}
      {choosenTemp === 'modern-cv' && <ModernCV {...commonProps} activePage={activePage} />}
    </>
  );
};

export default Preview;

