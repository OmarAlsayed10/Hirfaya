import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Stack,
  TextField,
  Link,
} from "@mui/material";
import { getBlogPosts } from "../constants/blogPosts";

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  const BLOG_POSTS = getBlogPosts(t);

  const filteredPosts = BLOG_POSTS.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 8 }, flex: 1 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={t("searchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <Link
              key={post.id}
              component={RouterLink}
              to={`/Blogs/${post.id}`}
              sx={{ textDecoration: "none", flex: "0 1 480px" }}
            >
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "100%",
                  height: 400,
                  boxShadow: 3,
                  borderRadius: 2,
                }}
              >
                <CardMedia
                  component="img"
                  sx={{ height: 180, objectFit: "cover" }}
                  image={post.image}
                  alt={post.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip
                    label={post.category}
                    variant="outlined"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="h6" color="primary">
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {post.excerpt}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    mt={2}
                  ></Stack>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Box textAlign="center" mt={8} width="100%">
            <Typography variant="h6">{t("noArticles")}</Typography>
            <Typography color="text.secondary">{t("adjustSearch")}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Blog;
