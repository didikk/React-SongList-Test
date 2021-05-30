export const addFavorite = (data) => ({
  type: 'ADD_FAVORITE',
  payload: data,
});

export const removeFavorite = (trackId) => ({
  type: 'REMOVE_FAVORITE',
  payload: trackId,
});
