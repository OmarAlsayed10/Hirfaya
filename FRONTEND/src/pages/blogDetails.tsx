import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import i18n from "../i18n";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslation } from "react-i18next";
import { getBlogPosts } from "../constants/blogPosts";

const BlogDetail = () => {
  const { t } = useTranslation();
  const currentLang = i18n.language;

  const BLOG_POSTS = getBlogPosts(t);

  const navigate = useNavigate();

  const { id } = useParams();
  const blogPost = BLOG_POSTS.find((post) => post.id === parseInt(id));

  if (!blogPost) {
    return <Typography variant="h6">Blog post not found.</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Button
        variant="text"
        startIcon={
          currentLang === "en" ? (
            <ArrowBackIcon />
          ) : (
            <ArrowForwardIcon sx={{ px: 1 }} />
          )
        }
        onClick={() => navigate("/blogs")}
        sx={{ mb: 3 }}
      >
        {t("Back to Blog")}
      </Button>

      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "16 / 9",
          margin: "0 auto",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={blogPost.image}
          alt={blogPost.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </Box>

      <Box mt={3}>
        <Chip label={blogPost.category} variant="outlined" />
        <Typography variant="h4" fontWeight="bold" mt={2}>
          {blogPost.title}
        </Typography>
      </Box>

      <Box mt={4}>
        {blogPost.content
          .split("\n")
          .filter((line: string) => line.trim() !== "")
          .map((paragraph: string, index: number) => (
            <Typography variant="body1" paragraph key={index}>
              {paragraph}
            </Typography>
          ))}
      </Box>
    </Container>
  );
};

export default BlogDetail;
