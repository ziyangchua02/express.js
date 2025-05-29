import { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // axios library to make HTTP requests
        const response = await axios.get('http://localhost:8080/posts');
        setPosts(response.data.posts);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch post');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      {posts.map((post) => (
        <Col key={post.id}>
          <Card>
            <Card.Img variant="top" src={post.image_url} style={{ height: '200px', objectFit: 'cover' }} />
            <Card.Body>
              <Card.Text>{post.caption}</Card.Text>
              <Link to={`/post/${post.id}`}>
                <Button variant="primary">View Details</Button>
              </Link>
            </Card.Body>
            <Card.Footer>
              <small className="text-muted">
                Posted on {new Date(post.created_at).toLocaleDateString()}
              </small>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default Home; 