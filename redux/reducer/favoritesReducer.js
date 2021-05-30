function favorites(state = [], action) {
  switch (action.type) {
    case 'ADD_FAVORITE':
      return [...state, action.payload];
    case 'REMOVE_FAVORITE':
      return state.filter((value) => value.trackId !== action.payload);
    default:
      return state;
  }
}

export default favorites;
