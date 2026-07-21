import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { PAYMENT_ENDPOINTS } from "../../../constants/endpoints";

export interface Plan {
  id: string;
  slug: string;
  displayName: string;
  priceEGP: string;
  durationDays: number;
  tier: string;
  kind: string;
  grantCredits: number;
}

export interface InstapayDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  amountEGP: string;
  currency: string;
  planDisplayName: string;
  durationDays: number;
  instructions: string[];
}

export interface CreditQuote {
  amountEGP: string;
  credits: number;
  egpPerCredit: string;
  pricingVersion: string;
}

export interface PaymentRequestStatus {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  amountSnapshot: string;
  currency: string;
  referenceNumber: string | null;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  purchaseKind: "SUBSCRIPTION" | "FIXED_TOPUP" | "CUSTOM_TOPUP";
  grantCreditsSnapshot: number;
  plan: { slug: string; displayName: string; durationDays: number } | null;
}

interface PaymentState {
  plans: Plan[];
  plansLoading: boolean;
  selectedPlan: Plan | null;
  instapayDetails: InstapayDetails | null;
  selectedCustomQuote: CreditQuote | null;
  detailsLoading: boolean;
  submitLoading: boolean;
  submitResult: { requestId: string; status: string } | null;
  paymentStatus: PaymentRequestStatus | null;
  statusLoading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  plans: [],
  plansLoading: false,
  selectedPlan: null,
  instapayDetails: null,
  selectedCustomQuote: null,
  detailsLoading: false,
  submitLoading: false,
  submitResult: null,
  paymentStatus: null,
  statusLoading: false,
  error: null,
};

export const fetchPlans = createAsyncThunk("payment/fetchPlans", async () => {
  const { data } = await axios.get(PAYMENT_ENDPOINTS.plans);
  return data.plans as Plan[];
});

export const fetchInstapayDetails = createAsyncThunk(
  "payment/fetchInstapayDetails",
  async (planId: string) => {
    const { data } = await axios.get(
      PAYMENT_ENDPOINTS.instapayDetails(planId),
      { withCredentials: true }
    );
    return data as InstapayDetails;
  }
);

export const fetchCustomInstapayDetails = createAsyncThunk(
  "payment/fetchCustomInstapayDetails",
  async (amountEGP: string) => {
    const { data } = await axios.post(
      PAYMENT_ENDPOINTS.customInstapayDetails,
      { amountEGP },
      { withCredentials: true },
    );
    return data as InstapayDetails;
  },
);

export const submitInstapayPayment = createAsyncThunk(
  "payment/submit",
  async (
    payload: { planId?: string; customAmountEGP?: string; referenceNumber: string; screenshot: File },
    { rejectWithValue }
  ) => {
    try {
      const form = new FormData();
      if (payload.planId) form.append("planId", payload.planId);
      if (payload.customAmountEGP) form.append("customAmountEGP", payload.customAmountEGP);
      form.append("referenceNumber", payload.referenceNumber);
      form.append("screenshot", payload.screenshot);

      const { data } = await axios.post(PAYMENT_ENDPOINTS.submit, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data as { requestId: string; status: string };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ?? "Failed to submit payment."
      );
    }
  }
);

export const fetchPaymentStatus = createAsyncThunk(
  "payment/fetchStatus",
  async () => {
    const { data } = await axios.get(PAYMENT_ENDPOINTS.status, {
      withCredentials: true,
    });
    return data.paymentRequest as PaymentRequestStatus | null;
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    selectPlan(state, action: PayloadAction<Plan>) {
      state.selectedPlan = action.payload;
      state.instapayDetails = null;
      state.selectedCustomQuote = null;
    },
    selectCustomQuote(state, action: PayloadAction<CreditQuote>) {
      state.selectedPlan = null;
      state.selectedCustomQuote = action.payload;
      state.instapayDetails = null;
    },
    clearError(state) {
      state.error = null;
    },
    resetSubmit(state) {
      state.submitResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.plansLoading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state) => {
        state.plansLoading = false;
        state.error = "Failed to load plans.";
      })
      .addCase(fetchInstapayDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchInstapayDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.instapayDetails = action.payload;
      })
      .addCase(fetchInstapayDetails.rejected, (state) => {
        state.detailsLoading = false;
        state.error = "Failed to load payment details.";
      })
      .addCase(fetchCustomInstapayDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomInstapayDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.instapayDetails = action.payload;
      })
      .addCase(fetchCustomInstapayDetails.rejected, (state) => {
        state.detailsLoading = false;
        state.error = "Failed to load custom payment details.";
      })
      .addCase(submitInstapayPayment.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(submitInstapayPayment.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.submitResult = action.payload;
      })
      .addCase(submitInstapayPayment.rejected, (state, action) => {
        state.submitLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaymentStatus.pending, (state) => {
        state.statusLoading = true;
      })
      .addCase(fetchPaymentStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(fetchPaymentStatus.rejected, (state) => {
        state.statusLoading = false;
      });
  },
});

export const { selectPlan, selectCustomQuote, clearError, resetSubmit } = paymentSlice.actions;
export { paymentSlice };
export default paymentSlice.reducer;
