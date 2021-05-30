import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import {
  Provider,
  Button,
  Title,
  Card,
  Searchbar,
  Avatar,
  Subheading,
  Headline,
  Caption,
  Appbar,
} from "react-native-paper";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import debounce from "lodash/debounce";
import axios from "axios";
import * as Linking from "expo-linking";

import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "./redux/store";

import useFavorites from "./useFavorites";

const API_URL = "https://itunes.apple.com/search?entity=song&limit=10&offset=0&term=";

let tokenSource;

const SongListScreen = ({ navigation, route }) => {
  const [addToFavorites, removeFromFavorites, isInFavorites] = useFavorites();
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState({});
  const [data, setData] = useState([]);

  const term = route.params.term;

  useEffect(() => {
    if (term.length > 0) {
      onChangeText(term);
    }
  }, [route]);

  const onChangeText = (text) => {
    setQuery(text);

    const search = debounce(fetchResults, 500);

    setSearchQuery((prevSearch) => {
      if (prevSearch.cancel) {
        prevSearch.cancel();
      }
      return search;
    });

    if (text.length > 0) {
      search(text);
    } else {
      setData([]);
    }
  };

  const goToFavorites = () => {
    navigation.navigate("Favorites");
  };

  const fetchResults = (text) => {
    if (typeof tokenSource !== typeof undefined) {
      tokenSource.cancel("Operation canceled due to new request.");
    }

    tokenSource = axios.CancelToken.source();

    axios
      .get(API_URL + text, { cancelToken: tokenSource.token })
      .then((res) => {
        setData(res.data.results);
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          return;
        }

        setData([]);
      });
  };

  const renderItem = ({ item, index }) => (
    <SongItem
      trackData={item}
      isInFavorites={isInFavorites(item.trackId)}
      addToFavorites={() => addToFavorites(item)}
      removeFromFavorites={() => removeFromFavorites(item.trackId)}
    />
  );

  return (
    <>
      <Appbar.Header dark={false} style={{ backgroundColor: "turquoise" }}>
        <Appbar.Content title="Search song" />
        <Button onPress={goToFavorites}>
          <AntDesign name="heart" size={25} color="black" />
        </Button>
      </Appbar.Header>
      <View style={styles.content}>
        <Searchbar
          placeholder="Search"
          onChangeText={onChangeText}
          value={query}
          style={{ marginBottom: 20 }}
        />
        <FlatList
          data={data}
          keyExtractor={(item) => item.trackId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
};

const FavoritesScreen = ({ navigation }) => {
  const [
    addToFavorites, 
    removeFromFavorites, 
    isInFavorites, 
    favorites
  ] = useFavorites();

  const goBack = () => {
    navigation.goBack();
  };

  const renderItem = ({ item, index }) => (
    <SongItem
      trackData={item}
      isInFavorites={isInFavorites(item.trackId)}
      addToFavorites={() => addToFavorites(item)}
      removeFromFavorites={() => removeFromFavorites(item.trackId)}
    />
  );

  return (
    <>
      <Appbar.Header dark={false} style={{ backgroundColor: "darkturquoise" }}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Appbar.Content title="Favorites" />
      </Appbar.Header>
      <View style={styles.content}>
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.trackId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
};

const SongDetailsScreen = ({ navigation, route }) => {
  const songData = route.params.data;

  const [addToFavorites, removeFromFavorites, isInFavorites] = useFavorites();

  const year = new Date(songData.releaseDate).getUTCFullYear();

  const goBack = () => {
    navigation.goBack();
  };

  const goToFavorites = () => {
    navigation.navigate("Favorites");
  };

  const removeFavorite = () => {
    removeFromFavorites(songData.trackId);
  };

  const addFavorite = () => {
    addToFavorites(songData);
  };

  return (
    <>
      <Appbar.Header dark={false} style={{ backgroundColor: "darkturquoise" }}>
        <TouchableOpacity onPress={goBack}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Appbar.Content title="Details" />
        <Button onPress={goToFavorites}>
          <AntDesign name="heart" size={25} color="black" />
        </Button>
      </Appbar.Header>
      <Card style={{ marginVertical: 5 }}>
        <Card.Cover
          source={{ uri: songData.artworkUrl100.replace("100x100", "600x600") }}
        />
        <Card.Content>
          <Title>{songData.artistName}</Title>
          <Headline>{songData.trackName}</Headline>
          <Subheading>{songData.collectionName}</Subheading>
          <Caption>
            {songData.primaryGenreName} ({year})
          </Caption>
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={
              isInFavorites(songData.trackId) ? removeFavorite : addFavorite
            }
          >
            <AntDesign
              name="heart"
              size={25}
              color={isInFavorites(songData.trackId) ? "tomato" : "lightgray"}
            />
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
};

const SongItem = ({
  isInFavorites,
  addToFavorites,
  removeFromFavorites,
  trackData,
}) => {
  const { navigate } = useNavigation();
  return (
    <Card style={{ marginVertical: 5 }}>
      <Card.Title
        title={
          <Title onPress={() => navigate("SongDetails", { data: trackData })}>
            {trackData.trackName}
          </Title>
        }
        subtitle={trackData.artistName}
        style={{ paddingVertical: 10, paddingHorizontal: 15 }}
        leftStyle={{ marginRight: 25 }}
        left={(props) => (
          <Avatar.Image
            size={50}
            source={{
              uri: trackData.artworkUrl100.replace("100x100", "600x600"),
            }}
          />
        )}
        right={() => (
          <Button
            onPress={isInFavorites ? removeFromFavorites : addToFavorites}
          >
            <AntDesign
              name="heart"
              size={25}
              color={isInFavorites ? "tomato" : "lightgray"}
            />
          </Button>
        )}
      />
    </Card>
  );
};

const Stack = createStackNavigator();

const prefix = Linking.createURL("/");

const App = () => {
  const config = {
    screens: {
      SongList: "search/:term", // example: exp://127.0.0.1:19000/--/search/paramore
      Favorites: "favorites",
    },
  };

  const linking = {
    prefixes: [prefix],
    config,
  };
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Provider>
          <NavigationContainer
            linking={linking}
            allback={<Text>Loading...</Text>}
          >
            <Stack.Navigator initialRouteName="SongList" headerMode="none">
              <Stack.Screen
                name="SongList"
                component={SongListScreen}
                initialParams={{ term: "" }}
              />
              <Stack.Screen name="Favorites" component={FavoritesScreen} />
              <Stack.Screen name="SongDetails" component={SongDetailsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 8,
  },
});
