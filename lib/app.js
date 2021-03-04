const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const request = require('superagent');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

//get endpoint to get from yelp
app.get('/api/search', async (req, res) => {
  try {
    //set query param for the URL
    const location = req.query.location;

    //create search URL by location
    const searchURL = await request.get(`https://api.yelp.com/v3/businesses/search?location=${location}`)
      .set('Authorization', `Bearer ${process.env.YELP_KEY}`)
      .set('Accept', 'application/json');

    //respond with the locations
    res.json(searchURL.body.businesses);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

//get favorite by id
app.get('/api/favorites', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT * 
    FROM favorites 
    WHERE user_id=$1`, [req.userId]);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

//post endpoint to post to database as favorite
app.post('/api/favorites', async (req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO favorites (
      yelp_id, 
      name, 
      image_url, 
      rating, 
      price, 
      user_id) 
    VALUES ($1, $2, $3, $4, $5, $6) 
    RETURNING *`,
      [
        req.body.yelp_id,
        req.body.name,
        req.body.image_url,
        req.body.rating,
        req.body.price,
        req.userId
      ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

//delete by id
app.delete('/api/favorites/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const data = await client.query(`
    DELETE FROM favorites 
    WHERE id=$1 
    RETURNING *`, [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;

