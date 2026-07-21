import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../redux/store/store";
import {
  fetchPlans,
  fetchInstapayDetails,
  submitInstapayPayment,
  fetchCustomInstapayDetails,
  fetchPaymentStatus,
  selectPlan,
  clearError,
  selectCustomQuote,
  resetSubmit,
  type Plan,
  type CreditQuote,
} from "../../../redux/store/slices/paymentSlice";

export type PaymentStep = "select-plan" | "instapay-details" | "submit" | "status";

export const usePayment = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    plans,
    plansLoading,
    selectedPlan,
    instapayDetails,
    selectedCustomQuote,
    detailsLoading,
    submitLoading,
    submitResult,
    paymentStatus,
    statusLoading,
    error,
  } = useSelector((s: RootState) => s.payment);

  const [step, setStep] = useState<PaymentStep>("select-plan");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [refError, setRefError] = useState("");

  const autoJumped = useRef(false);

  useEffect(() => {
    dispatch(fetchPlans());
    dispatch(fetchPaymentStatus());
  }, [dispatch]);

  // Returning user with an unresolved request lands straight on the status card
  useEffect(() => {
    if (autoJumped.current) return;
    if (paymentStatus?.status === "PENDING") {
      autoJumped.current = true;
      setStep("status");
    }
  }, [paymentStatus]);

  // After successful submit, move to status step
  useEffect(() => {
    if (submitResult) {
      setStep("status");
      dispatch(fetchPaymentStatus());
    }
  }, [submitResult, dispatch]);

  useEffect(() => {
    if (paymentStatus?.status === "APPROVED") {
      window.dispatchEvent(new Event("quota:refresh"));
    }
  }, [paymentStatus?.status]);

  // Poll every 30 s while on status step and payment is still pending
  useEffect(() => {
    if (step !== "status") return;
    if (paymentStatus?.status === "APPROVED" || paymentStatus?.status === "REJECTED") return;

    const id = setInterval(() => {
      dispatch(fetchPaymentStatus());
    }, 30_000);

    return () => clearInterval(id);
  }, [step, paymentStatus?.status, dispatch]);

  const handleSelectPlan = (plan: Plan) => {
    dispatch(selectPlan(plan));
    dispatch(fetchInstapayDetails(plan.id));
    setStep("instapay-details");
  };

  const handleContinueToSubmit = () => setStep("submit");
  const handleSelectCustomQuote = (quote: CreditQuote) => {
    dispatch(selectCustomQuote(quote));
    dispatch(fetchCustomInstapayDetails(quote.amountEGP));
    setStep("instapay-details");
  };


  const handleScreenshotChange = (file: File | null) => {
    setFileError("");
    setScreenshot(file);
  };

  const handleSubmit = async () => {
    let valid = true;
    if (!referenceNumber.trim()) {
      setRefError("Reference number is required.");
      valid = false;
    }
    if (!screenshot) {
      setFileError("Please upload your payment screenshot.");
      valid = false;
    }
    if (!valid || (!selectedPlan && !selectedCustomQuote)) return;

    dispatch(
      submitInstapayPayment({
        planId: selectedPlan?.id,
        customAmountEGP: selectedCustomQuote?.amountEGP,
        referenceNumber: referenceNumber.trim(),
        screenshot: screenshot!,
      })
    );
  };

  const handleBack = () => {
    dispatch(clearError());
    if (step === "instapay-details") setStep("select-plan");
    if (step === "submit") setStep("instapay-details");
  };

  const handleRetry = () => {
    dispatch(resetSubmit());
    setReferenceNumber("");
    setScreenshot(null);
    setStep("select-plan");
  };

  return {
    step,
    plans,
    plansLoading,
    selectedPlan,
    instapayDetails,
    detailsLoading,
    referenceNumber,
    selectedCustomQuote,
    setReferenceNumber,
    screenshot,
    fileError,
    refError,
    submitLoading,
    submitResult,
    paymentStatus,
    statusLoading,
    error,
    handleSelectPlan,
    handleContinueToSubmit,
    handleScreenshotChange,
    handleSubmit,
    handleSelectCustomQuote,
    handleBack,
    handleRetry,
  };
};
