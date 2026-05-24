import { Box, Button, Paper, TextField, CircularProgress } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useTranslation } from 'react-i18next';
import grammarCheckInput from './grammarCheckInput.tokens';
import type { GrammarCheckInputProps } from './GrammarCheckInput.types';

export const GrammarCheckInput = ({
  grammarText,
  handleContentChange,
  handleClear,
  handleCheckGrammar,
  isLoading,
  isButtonVisible,
}: GrammarCheckInputProps) => {
  const { t } = useTranslation();

  return (
    <Paper elevation={0} sx={grammarCheckInput.paper}>
      <TextField
        multiline
        rows={16}
        variant="outlined"
        fullWidth
        placeholder={t('inputPlaceholder')}
        value={grammarText}
        onChange={handleContentChange}
        sx={grammarCheckInput.textField}
      />

      <Box sx={grammarCheckInput.actionsRow}>
        <Button variant="text" onClick={handleClear} sx={grammarCheckInput.clearButton}>
          {t('clear')}
        </Button>
        <Button
          variant="contained"
          onClick={handleCheckGrammar}
          disabled={isLoading || !isButtonVisible}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
          sx={grammarCheckInput.checkButton}
        >
          {isLoading ? t('Checking...') : t('checkGrammar')}
        </Button>
      </Box>
    </Paper>
  );
};
