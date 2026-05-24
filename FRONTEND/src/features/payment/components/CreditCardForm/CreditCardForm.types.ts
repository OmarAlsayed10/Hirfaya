export interface CardFormValues {
  name: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  address: string;
}

export interface CreditCardFormProps {
  form: CardFormValues;
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}
