import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { CV_ENDPOINTS } from "../constants/endpoints";
import { setTemplate } from "../redux/store/slices/cvBuilderSlice";
import type { RootState } from "../redux/store/store";

export const useTemplate = () => {
    const dispatch = useDispatch();
    const choosenTemp = useSelector((state: RootState) => state.cvBuilder.template);
    const currentCvId = useSelector((state: RootState) => state.cvBuilder.currentCvId);

    const setChoosenTemp = (template: string) => {
        dispatch(setTemplate(template));
        // ponytail: fire-and-forget autosave; an unsaved CV has no id yet and the
        // explicit Save writes the template anyway, so a failure here is recoverable.
        if (currentCvId) {
            void axios
                .put(CV_ENDPOINTS.update(currentCvId), { template }, { withCredentials: true })
                .catch(() => {});
        }
    };

    return { choosenTemp, setChoosenTemp };
};
