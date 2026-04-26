import API from './index';
import { handleApiError } from '../utils/errorHandling';

export const fetchUserData = async () => {
  try {
    const response = await API.get('/users/me');
    return response.data.data.user;
  } catch (error) {
    throw handleApiError(error, 'failed to fetch user data');
  }
};
