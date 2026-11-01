import { postImageParams } from '../../backend/utils/cloudinaryUpload.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('post image upload params', () => {
  const file = { originalname: 'IMG_2041_mykal_bedroom.jpg' };

  test('should name each upload with a random uuid', () => {
    expect(postImageParams.public_id({}, file)).toMatch(UUID);
  });

  test('should give two uploads of the same file different names', () => {
    expect(postImageParams.public_id({}, file)).not.toBe(postImageParams.public_id({}, file));
  });

  test('should not put the original filename in the public id', () => {
    expect(postImageParams.public_id({}, file)).not.toContain('bedroom');
    expect(postImageParams.use_filename).toBeUndefined();
  });

  test('should still refuse to overwrite an existing image', () => {
    expect(postImageParams.overwrite).toBe(false);
  });
});
