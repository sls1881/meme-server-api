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
          id: 2,
          yelp_id: 'dfsdfdsf7',
          name: 'Screen Door',
          image_url: 'https://cdn.vox-cdn.com/thumbor/1lSaieb0-C2VSB752pnWk0FdLhg=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/19569065/Studio_Session_080_3_1_.jpg',
          rating: '5',
          price: '$$',
          user_id: 2,
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/favorites')
        .set('Authorization', token);
      // .expect('Content-Type', /json/)
      // .expect(200);

      expect(data.body).toEqual(expectation);
    });

    // //test delete favorite by ID
    // test('Delete a single character by id', async () => {

    //   const expectation = {
    //     id: 2,
    //     yelp_id: 'dfsdfdsf7',
    //     name: 'Screen Door',
    //     image_url: 'https://cdn.vox-cdn.com/thumbor/1lSaieb0-C2VSB752pnWk0FdLhg=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/19569065/Studio_Session_080_3_1_.jpg',
    //     rating: '5',
    //     price: '$$',
    //     user_id: 2,
    //   };

    //   const data = await fakeRequest(app)
    //     .delete('/api/favorites/2')
    //     .set('Authorization', token);
    //   // .expect('Content-Type', /json/)
    //   // .expect(200);

    //   expect(data.body).toEqual(expectation);


    //   const nothing = await fakeRequest(app)
    //     .get('/api/favorites/2')
    //     .set('Authorization', token);
    //   // .expect('Content-Type', /json/)
    //   // .expect(200);

    //   expect(nothing.body).toEqual('');
    // });

    //test get yelp review
    // test('It should return a review from yelp', () => {

    //   const expectation = [
    //     {
    //       yelp_id: 'Ys42wLKqrflqmtqkgqOXgA',
    //       name: 'Luc Lac',
    //       image_url: 'https://s3-media1.fl.yelpcdn.com/bphoto/azr6sD6VeJbdaiO2aKvSsw/o.jpg',
    //       rating: '4.5',
    //       price: '$$',
    //     }
    //   ];

    //   const actual = [
    //     {
    //       'id': 'Ys42wLKqrflqmtqkgqOXgA',
    //       'alias': 'luc-lac-portland-7',
    //       'name': 'Luc Lac',
    //       'image_url': 'https://s3-media1.fl.yelpcdn.com/bphoto/azr6sD6VeJbdaiO2aKvSsw/o.jpg',
    //       'is_closed': false,
    //       'url': 'https://www.yelp.com/biz/luc-lac-portland-7?adjust_creative=CQE1JjgHx0oM_A9JTQhg7A&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=CQE1JjgHx0oM_A9JTQhg7A',
    //       'review_count': 3205,
    //       'categories': [
    //         {
    //           'alias': 'vietnamese',
    //           'title': 'Vietnamese'
    //         },
    //         {
    //           'alias': 'tapasmallplates',
    //           'title': 'Tapas/Small Plates'
    //         },
    //         {
    //           'alias': 'cocktailbars',
    //           'title': 'Cocktail Bars'
    //         }
    //       ],
    //       'rating': 4.0,
    //       'coordinates': {
    //         'latitude': 45.516868,
    //         'longitude': -122.675447
    //       },
    //       'transactions': [
    //         'pickup',
    //         'delivery'
    //       ],
    //       'price': '$$',
    //       'location': {
    //         'address1': '835 SW 2nd Ave',
    //         'address2': null,
    //         'address3': '',
    //         'city': 'Portland',
    //         'zip_code': '97204',
    //         'country': 'US',
    //         'state': 'OR',
    //         'display_address': [
    //           '835 SW 2nd Ave',
    //           'Portland, OR 97204'
    //         ]
    //       },
    //       'phone': '+15032220047',
    //       'display_phone': '(503) 222-0047',
    //       'distance': 1312.1776320869053
    //     }
    //   ];

    //   expect(actual).toEqual(expectation);
    // });

  });
});
