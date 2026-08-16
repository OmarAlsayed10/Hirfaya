import store, { resetStore } from "./store";

const DRAFT_KEY = "cvBuilderDraft";
const DRAFT_OWNER_KEY = "cvBuilderDraftOwner";

const syncDraftOwner = (userId: string | null) => {
  try {
    const owner = localStorage.getItem(DRAFT_OWNER_KEY);
    if (owner && owner !== userId) {
      localStorage.removeItem(DRAFT_KEY);
      store.dispatch(resetStore());
    }
    if (userId) localStorage.setItem(DRAFT_OWNER_KEY, userId);
    else localStorage.removeItem(DRAFT_OWNER_KEY);
  } catch {
    return;
  }
};

export default syncDraftOwner;
