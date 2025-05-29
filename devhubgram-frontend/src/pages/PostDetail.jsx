import { useState, useEffect } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/posts/${id}`);
        setPost(response.data.post);
        setCaption(response.data.post.caption);
        setImageUrl(response.data.post.image_url);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://localhost:8080/posts/${id}`, {
        caption,
        image_url: imageUrl
      });
      setPost(response.data.post);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8080/posts/${id}`);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete post');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-width-800 mx-auto">
      {isEditing ? (
        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3">
            <Form.Label>Caption</Form.Label>
            <Form.Control
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="me-2">
            Save Changes
          </Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </Form>
      ) : (
        <Card>
          <Card.Img variant="top" src={post.image_url} style={{ maxHeight: '500px', objectFit: 'contain' }} />
          <Card.Body>
            <Card.Text>{post.caption}</Card.Text>
            <Button variant="primary" onClick={() => setIsEditing(true)} className="me-2">
              Edit
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Card.Body>
          <Card.Footer>
            <small className="text-muted">
              Posted on {new Date(post.created_at).toLocaleDateString()}
            </small>
          </Card.Footer>
        </Card>
      )}
    </div>
  );
}

export default PostDetail; 