import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { PAYMENT_ENDPOINTS } from "../../../constants/endpoints";
import { useFeedback } from "../../../context/FeedbackContext";
import type { CreditQuote, Plan } from "../../../redux/store/slices/paymentSlice";

interface InvalidQuote {
  code: "FRACTIONAL_CREDITS";
  lower: CreditQuote | null;
  higher: CreditQuote | null;
  message?: string;
}

interface Props {
  plans: Plan[];
  selectedPlanId: string | null;
  onSelectPlan: (plan: Plan) => void;
  onSelectCustom: (quote: CreditQuote) => void;
}

const FIXED_ORDER = ["topup-100", "topup-500", "topup-1500"];

const CreditPurchaseCards = ({
  plans,
  selectedPlanId,
  onSelectPlan,
  onSelectCustom,
}: Props) => {
  const { t } = useTranslation();
  const { notify } = useFeedback();
  const [customOpen, setCustomOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<CreditQuote | null>(null);
  const [invalid, setInvalid] = useState<InvalidQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const amountNumber = Number(amount);
  const localAmountError = amount && (
    !/^d+(?:.d{1,2})?$/.test(amount) || amountNumber < 25 || amountNumber > 5000
  ) ? t("Enter an amount from 25 to 5,000 EGP with at most two decimals.") : null;


  const fixedPlans = useMemo(
    () =>
      FIXED_ORDER.map((slug) => plans.find((plan) => plan.slug === slug)).filter(
        (plan): plan is Plan => Boolean(plan),
      ),
    [plans],
  );

  useEffect(() => {
    setQuote(null);
    setInvalid(null);
    if (!customOpen || !amount.trim()) return;
    if (localAmountError) return;
    const timeout = window.setTimeout(async () => {
      setQuoting(true);
      try {
        const response = await axios.post<CreditQuote>(
          PAYMENT_ENDPOINTS.creditQuote,
          { amountEGP: amount },
          { withCredentials: true },
        );
        setQuote(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data?.code === "FRACTIONAL_CREDITS") {
          setInvalid(error.response.data as InvalidQuote);
        } else if (axios.isAxiosError(error) && error.response?.data?.message) {
          notify(error.response.data.message);
        } else {
          notify(t("We couldn't calculate that credit amount."));
        }
      } finally {
        setQuoting(false);
      }
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [amount, customOpen, localAmountError, notify, t]);

  const nearest = [invalid?.lower, invalid?.higher].filter(
    (item): item is CreditQuote => Boolean(item),
  );

  return (
    <Box mt={4}>
      <Typography variant="h6" fontWeight={800}>{t("Buy credits")}</Typography>
      <Typography color="text.secondary" fontSize={14} mb={2}>
        {t("One-time credits are added to your balance without changing your plan.")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
          alignItems: "stretch",
        }}
      >
        {fixedPlans.map((plan) => {
          const selected = selectedPlanId === plan.id;
          return (
            <Card
              key={plan.id}
              variant="outlined"
              sx={{ borderRadius: 3, borderWidth: selected ? 2 : 1, borderColor: selected ? "primary.main" : "divider" }}
            >
              <CardActionArea onClick={() => onSelectPlan(plan)} sx={{ height: "100%" }}>
                <CardContent>
                  <AutoAwesomeRoundedIcon color="primary" />
                  <Typography variant="h5" fontWeight={800} mt={2}>
                    {plan.grantCredits.toLocaleString()}
                  </Typography>
                  <Typography color="text.secondary">{t("credits")}</Typography>
                  <Typography fontWeight={800} color="primary.main" mt={2}>
                    {plan.priceEGP} EGP
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
        <Card
          variant="outlined"
          sx={{ borderRadius: 3, borderWidth: customOpen ? 2 : 1, borderColor: customOpen ? "primary.main" : "divider" }}
        >
          <CardActionArea
            component="div"
            onClick={() => setCustomOpen(true)}
            sx={{ height: "100%", cursor: customOpen ? "default" : "pointer" }}
          >
            <CardContent>
              <AddRoundedIcon color="primary" />
              <Typography variant="h6" fontWeight={800} mt={1}>{t("Custom amount")}</Typography>
              {!customOpen ? (
                <Typography color="text.secondary" fontSize={13} mt={1}>
                  {t("Choose between 25 and 5,000 EGP")}
                </Typography>
              ) : (
                <Stack spacing={1.5} mt={2} onClick={(event) => event.stopPropagation()}>
                  <TextField
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    label={t("Amount to pay (EGP)")}
                    type="number"
                    inputProps={{ min: 25, max: 5000, step: 0.01 }}
                    error={Boolean(localAmountError)}
                    helperText={localAmountError || "0.70 EGP per whole credit"}
                    size="small"
                    fullWidth
                  />
                  {quoting && <CircularProgress size={20} />}
                  {quote && (
                    <>
                      <Typography color="primary.main" fontWeight={800}>
                        {Number(quote.amountEGP).toLocaleString()} EGP = {quote.credits.toLocaleString()} {t("credits")}
                      </Typography>
                      <Button variant="contained" onClick={() => onSelectCustom(quote)}>
                        {t("Continue")}
                      </Button>
                    </>
                  )}
                  {nearest.length > 0 && (
                    <Box>
                      <Typography color="error" fontSize={12}>
                        {t("That amount creates a partial credit. Choose a whole-credit amount:")}
                      </Typography>
                      {nearest.map((item) => (
                        <Button
                          key={item.amountEGP}
                          size="small"
                          onClick={() => setAmount(item.amountEGP)}
                          sx={{ mr: 1, mt: 0.5 }}
                        >
                          {item.amountEGP} EGP = {item.credits} {t("credits")}
                        </Button>
                      ))}
                    </Box>
                  )}
                </Stack>
              )}
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
    </Box>
  );
};

export default CreditPurchaseCards;
