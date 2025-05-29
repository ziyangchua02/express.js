const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
 
const app = express();
const PORT = process.env.PORT || 8080;
 
// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
 
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// Test route
app.get("/", (req, res) => {
  res.json({ message: "API is running!" });
});
 
// Test Supabase connection
app.get("/test-db", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("count", { count: "exact" });
 
    if (error) throw error;
 
    res.json({
      message: "Supabase connected successfully!",
      posts_count: data.length
    });
  } catch (error) {
    console.error("Supabase connection error:", error);
    res.status(500).json({ error: "Failed to connect to Supabase" });
  }
});
 
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
 
// Database helper functions using Supabase
async function getAllPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getPostById(id) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

async function createPost(caption, imageUrl) {
  const { data, error } = await supabase
    .from('posts')
    .insert([{ caption, image_url: imageUrl }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updatePost(id, caption, imageUrl) {
  const { data, error } = await supabase
    .from('posts')
    .update({ caption, image_url: imageUrl })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deletePost(id) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Routes

// GET all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ success: false, error: 'Failed to get posts' });
  }
});

// GET single post by ID
app.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, post });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({ success: false, error: 'Failed to get post' });
  }
});

// POST create new post
app.post('/posts', async (req, res) => {
  try {
    const { caption, image_url } = req.body;

    if (!caption || !image_url) {
      return res.status(400).json({
        success: false,
        error: 'Caption and image_url are required'
      });
    }

    const newPost = await createPost(caption, image_url);
    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ success: false, error: 'Failed to create post' });
  }
});

// PUT update post
app.put('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, image_url } = req.body;

    if (!caption || !image_url) {
      return res.status(400).json({
        success: false,
        error: 'Caption and image_url are required'
      });
    }

    const updatedPost = await updatePost(id, caption, image_url);

    if (!updatedPost) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    res.json({ success: true, post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ success: false, error: 'Failed to update post' });
  }
});

// DELETE post
app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if post exists first
    const existingPost = await getPostById(id);
    if (!existingPost) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    await deletePost(id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
});
