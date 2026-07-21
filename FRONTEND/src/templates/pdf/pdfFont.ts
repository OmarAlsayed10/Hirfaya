import { Font } from "@react-pdf/renderer";
import cairo400 from "@expo-google-fonts/cairo/400Regular/Cairo_400Regular.ttf?url";
import cairo700 from "@expo-google-fonts/cairo/700Bold/Cairo_700Bold.ttf?url";
import i18n from "../../i18n";

Font.register({
  family: "Cairo",
  fonts: [
    { src: cairo400, fontWeight: 400 },
    { src: cairo700, fontWeight: 700 },
  ],
});

export const isPdfRtl = () => i18n.language === "ar";
export const pdfLangStyle = () =>
  i18n.language === "ar" ? { fontFamily: "Cairo", direction: "rtl" as const } : {};
export const tp = (key: string) => i18n.t(key);
