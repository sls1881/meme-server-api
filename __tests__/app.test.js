require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    //test post endpoint
    test('creates a favorite', async () => {

      const newFav = {
        yelp_id: 'dfsdfdsf7',
        name: 'Screen Door',
        image_url: 'https://cdn.vox-cdn.com/thumbor/1lSaieb0-C2VSB752pnWk0FdLhg=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/19569065/Studio_Session_080_3_1_.jpg',
        rating: '5',
        price: '$$'
      };

      const expectFav = {
        ...newFav,
        id: 2,
        user_id: 2,
      };

      const data = await fakeRequest(app)
        .post('/api/favorites')
        .set('Authorization', token)
        .send(newFav);
      // .expect('Content-Type', /json/)
      //   .expect(200);

      expect(data.body).toEqual(expectFav);
    });

    //test get favorites endpoint
    test('returns all favorites', async () => {

      const expectation = [
        {
          'yelp_id': 'jfdjfasdjfdsf',
          'name': 'Screen Door',
          'image_url': 'https://cdn.vox-cdn.com/thumbor/1lSaieb0-C2VSB752pnWk0FdLhg=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/19569065/Studio_Session_080_3_1_.jpg',
          'rating': '5',
          'price': '$$',
          'user_id': 2
        },
        {
          'yelp_id': 'jfdjfkjdfldsj',
          'name': 'Jam',
          'image_url': 'https://cdn.vox-cdn.com/thumbor/1lSaieb0-C2VSB752pnWk0FdLhg=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/19569065/Studio_Session_080_3_1_.jpg',
          'rating': '5',
          'price': '$$',
          'user_id': 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token);
      // .expect('Content-Type', /json/)
      // .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
