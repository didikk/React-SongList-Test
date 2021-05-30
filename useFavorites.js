import { useSelector, useDispatch } from 'react-redux';
import { addFavorite, removeFavorite } from './redux/action/favoritesAction';

const useFavorites = () => {
  const favorites = useSelector((state) => state.favorites);

  const dispatch = useDispatch();

  const addToFavorites = (song) => {
    dispatch(addFavorite(song));
  };

  const removeFromFavorites = (trackId) => {
    dispatch(removeFavorite(trackId));
  };

  const isInFavorites = (trackId) => {
    return favorites.find((value) => value.trackId === trackId);
  };

  return [addToFavorites, removeFromFavorites, isInFavorites, favorites];
};

export default useFavorites;
