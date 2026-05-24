import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  Paper,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import grammarCheckResults from './grammarCheckResults.tokens';
import type { GrammarCheckResultsProps, GrammarIssue } from './GrammarCheckResults.types';
import { COLORS } from '../../../../theme/tokens';

export const GrammarCheckResults = ({
  error,
  isLoading,
  grammarResult,
  selectedTab,
  setSelectedTab,
  issues,
  filteredIssues,
  handleFix,
}: GrammarCheckResultsProps) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={0} sx={grammarCheckResults.paper}>
      <Typography sx={grammarCheckResults.sectionTitle}>
        {t('resultTitle', 'Analysis Results')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px', mb: 3 }}>{error}</Alert>
      )}

      {!grammarResult && !isLoading && !error && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.6 }}>
          <AutoFixHighIcon sx={{ fontSize: 60, color: COLORS.primary, mb: 2 }} />
          <Typography sx={{ fontSize: '1.05rem', maxWidth: 250, color: COLORS.textPrimary }}>
            {t('promptToCheck', 'Click \'Check Grammar\' to let our AI scan your text for errors.')}
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      )}

      {grammarResult && !isLoading && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={selectedTab}
            onChange={(_e, newValue) => setSelectedTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={grammarCheckResults.tabs}
          >
            <Tab label={`All (${issues.length})`} value="All" />
            <Tab label={t('grammar')} value="Grammar" />
            <Tab label={t('spelling')} value="Spelling" />
            <Tab label={t('punctuation')} value="Punctuation" />
            <Tab label={t('style')} value="Style" />
          </Tabs>

          <Box sx={{ flexGrow: 1, pr: 1 }}>
            {filteredIssues.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '1.1rem', color: COLORS.textSecondary, mb: 1 }}>{t('noIssuesFound', 'No issues found!')}</Typography>
                <Typography sx={{ fontSize: '0.95rem', color: COLORS.primary, fontWeight: 'bold' }}>Your text looks perfect.</Typography>
              </Box>
            ) : (
              filteredIssues.map((issue: GrammarIssue) => {
                const [wrong, correct] = issue.suggestion.split('→').map((str) => str.trim());

                return (
                  <Card elevation={0} key={issue.id} sx={grammarCheckResults.issueCard}>
                    <CardContent sx={{ p: 2, pb: '16px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Chip
                          label={t(issue.type.toLowerCase())}
                          size="small"
                          sx={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            borderRadius: '6px',
                            backgroundColor: issue.type === 'Grammar' ? '#fdecea' : issue.type === 'Punctuation' ? '#e8f4fd' : issue.type === 'Spelling' ? '#fff3e0' : '#e9f7ef',
                            color: issue.type === 'Grammar' ? '#b71c1c' : issue.type === 'Punctuation' ? '#0d47a1' : issue.type === 'Spelling' ? '#e65100' : '#1b5e20',
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          sx={grammarCheckResults.fixButton}
                          onClick={() => handleFix(wrong, correct, issue.id)}
                        >
                          {t('fix')}
                        </Button>
                      </Box>

                      <Typography sx={{ fontSize: '1.05rem', lineHeight: 1.6, color: COLORS.textPrimary }}>
                        <span style={{ textDecoration: 'line-through', color: '#c25b1a', opacity: 0.7, marginRight: '4px' }}>
                          {wrong}
                        </span>
                        <span style={{ color: COLORS.textSecondary, margin: '0 4px' }}>→</span>
                        <span style={{ color: COLORS.primary, fontWeight: 'bold', marginLeft: '4px' }}>
                          {correct}
                        </span>
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
};
