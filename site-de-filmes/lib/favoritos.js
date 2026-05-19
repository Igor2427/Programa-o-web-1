"use client";
import Parse from "./parse";

function getCurrentUser() {
  return Parse.User.current();
}

export async function saveFavorite(movie) {
  const Favorite = Parse.Object.extend("Favorite");

  try {
    const query = new Parse.Query(Favorite);

    query.equalTo("user", getCurrentUser());
    query.equalTo("movieId", movie.id);

    const existingFavorite = await query.first();

    if (existingFavorite) {
      console.log("Filme já está nos favoritos");
      return false;
    }

    const favorite = new Favorite();

    favorite.set("user", getCurrentUser());
    favorite.set("movieId", movie.id);
    favorite.set("title", movie.title);
    favorite.set("posterPath", movie.poster_path);

    await favorite.save();

    return true;
  } catch (error) {
    console.error("Erro ao salvar favorito:", error);
    return false;
  }
}

export async function getFavorites() {
  const Favorite = Parse.Object.extend("Favorite");
  const query = new Parse.Query(Favorite);

  query.equalTo("user", getCurrentUser());

  try {
    const results = await query.find();

    return results.map((fav) => ({
      id: fav.get("movieId"),
      title: fav.get("title"),
      posterPath: fav.get("posterPath"),
    }));
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    return [];
  }
}

export async function removeFavorite(movieId) {
  const Favorite = Parse.Object.extend("Favorite");
  const query = new Parse.Query(Favorite);

  query.equalTo("user", getCurrentUser());
  query.equalTo("movieId", movieId);

  try {
    const result = await query.first();

    if (result) {
      await result.destroy();
      return true;
    }

    return false;
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return false;
  }
}