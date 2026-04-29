import { saveFavorite, getFavorites, removeFavorite } from "../lib/favoritos";
import Parse from "../lib/parse";

jest.mock("../lib/parse");

describe("Integração - Favoritos", () => {
  let mockDB = [];

  beforeEach(() => {
    mockDB = [];
    jest.clearAllMocks();

    Parse.User.current.mockReturnValue({ id: "user1" });

    Parse.Object.extend.mockImplementation(() => {
      return function () {
        return {
          set: function (key, value) {
            this[key] = value;
          },
          save: jest.fn().mockImplementation(function () {
            mockDB.push({
              get: (field) => this[field],
              movieId: this.movieId
            });
            return Promise.resolve();
          }),
        };
      };
    });

    Parse.Query.mockImplementation(() => ({
      equalTo: jest.fn().mockReturnThis(),

      find: jest.fn().mockResolvedValue(mockDB),

      first: jest.fn().mockImplementation(() => {
        return Promise.resolve(mockDB[0] || null);
      }),
    }));
  });

  test("fluxo completo: salvar → listar → remover", async () => {
    const movie = {
      id: 1,
      title: "Filme A",
      poster_path: "/img.jpg"
    };

    const saved = await saveFavorite(movie);
    expect(saved).toBe(true);

    const list = await getFavorites();
    expect(list.length).toBe(1);
    expect(list[0].title).toBe("Filme A");

    Parse.Query.mockImplementation(() => ({
      equalTo: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({
        destroy: jest.fn().mockImplementation(() => {
          mockDB = [];
          return Promise.resolve();
        })
      })
    }));

    const removed = await removeFavorite(1);
    expect(removed).toBe(true);

    Parse.Query.mockImplementation(() => ({
      equalTo: jest.fn().mockReturnThis(),
      find: jest.fn().mockResolvedValue(mockDB)
    }));

    const listAfter = await getFavorites();
    expect(listAfter.length).toBe(0);
  });
});