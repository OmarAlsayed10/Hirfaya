import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Radio,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from "../../../../theme/tokens";
import type { Plan } from "../../../../redux/store/slices/paymentSlice";

interface Props {
  plans: Plan[];
  loading: boolean;
  selectedPlanId: string | null;
  onSelect: (plan: Plan) => void;
}

type Cycle = "Monthly" | "Annual";

const BADGE: Record<string, string> = {
  "pro-monthly": "Most Popular",
  "ultra-annual": "Best Value",
};

const cycleOf = (plan: Plan): Cycle =>
  plan.durationDays >= 365 ? "Annual" : "Monthly";

export const PlanSummaryCards = ({ plans, loading, selectedPlanId, onSelect }: Props) => {
  const { t } = useTranslation();
  const [cycle, setCycle] = useState<Cycle>("Monthly");

  if (loading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={100} />
        ))}
      </Box>
    );
  }

  const subs = plans.filter((p) => p.kind !== "topup");
  const credits = plans.filter((p) => p.kind === "topup");
  const cycleSubs = subs.filter((p) => cycleOf(p) === cycle);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <ToggleButtonGroup
        exclusive
        fullWidth
        value={cycle}
        onChange={(_, v) => v && setCycle(v)}
        sx={{
          bgcolor: COLORS.bgLight,
          borderRadius: RADIUS.md,
          p: 0.5,
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: `${RADIUS.sm}px !important`,
            textTransform: "none",
            fontWeight: 600,
            color: COLORS.textSecondary,
            py: 1,
          },
          "& .Mui-selected": {
            bgcolor: `${COLORS.bgWhite} !important`,
            color: `${COLORS.textPrimary} !important`,
            boxShadow: SHADOWS.sm,
          },
        }}
      >
        <ToggleButton value="Monthly">{t('Monthly')}</ToggleButton>
        <ToggleButton value="Annual">{t('Annual')}</ToggleButton>
      </ToggleButtonGroup>

      {cycleSubs.map((plan) => {
        const selected = plan.id === selectedPlanId;
        const badge = BADGE[plan.slug];
        return (
          <Card
            key={plan.id}
            elevation={0}
            sx={{
              border: `2px solid ${selected ? COLORS.primary : COLORS.borderLight}`,
              borderRadius: RADIUS.lg,
              boxShadow: selected ? SHADOWS.lg : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <CardActionArea onClick={() => onSelect(plan)} sx={{ p: 0 }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                <CheckCircleIcon
                  sx={{
                    color: selected ? COLORS.primary : COLORS.borderLight,
                    fontSize: 28,
                    flexShrink: 0,
                    transition: "color 0.2s",
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: TYPOGRAPHY.fontSerif,
                        fontWeight: 600,
                        color: COLORS.textPrimary,
                        fontSize: TYPOGRAPHY.sizeMd,
                      }}
                    >
                      {plan.displayName}
                    </Typography>
                    {badge && (
                      <Chip
                        label={t(badge)}
                        size="small"
                        sx={{
                          bgcolor: COLORS.primaryAlpha12,
                          color: COLORS.primary,
                          fontWeight: 600,
                          fontSize: TYPOGRAPHY.sizeXs,
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, mt: 0.25 }}>
                    {plan.durationDays} {t('days access')}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: TYPOGRAPHY.sizeLg,
                    color: COLORS.primary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {plan.priceEGP} EGP
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}

      {credits.length > 0 && (
        <>
          <Divider sx={{ mt: 1 }} />
          <Box>
            <Typography
              sx={{ fontWeight: 600, color: COLORS.textPrimary, fontSize: TYPOGRAPHY.sizeMd }}
            >
              {t('Add credits')}
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
              {t('One-time top-up added to your balance — no change to your plan.')}
            </Typography>
          </Box>

          {credits.map((plan) => {
            const selected = plan.id === selectedPlanId;
            return (
              <Card
                key={plan.id}
                elevation={0}
                sx={{
                  border: `2px solid ${selected ? COLORS.primary : COLORS.borderLight}`,
                  borderRadius: RADIUS.lg,
                  boxShadow: selected ? SHADOWS.lg : "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              >
                <CardActionArea onClick={() => onSelect(plan)} sx={{ p: 0 }}>
                  <CardContent sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}>
                    <Radio checked={selected} sx={{ color: COLORS.borderLight, "&.Mui-checked": { color: COLORS.primary } }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                        {plan.displayName}
                      </Typography>
                      {plan.grantCredits > 0 && (
                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          +{plan.grantCredits} {t('credits')}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: TYPOGRAPHY.sizeLg,
                        color: COLORS.primary,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {plan.priceEGP} EGP
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </>
      )}
    </Box>
  );
};
