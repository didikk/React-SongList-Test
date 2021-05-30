import { combineReducers } from 'redux';
import favoritesReducer from './favoritesReducer';

const reducer = combineReducers({
  favorites: favoritesReducer,
});

export default reducer;
