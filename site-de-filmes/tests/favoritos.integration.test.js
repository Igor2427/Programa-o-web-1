import { saveFavorite, getFavorites, removeFavorite } from "../lib/favoritos";
import Parse from "../lib/parse";

jest.mock("../lib/parse");

describe("Integração - Favoritos", () => {

  let mockDB = [];

  beforeEach(() => {
    mockDB = [];

    Parse.User.current.mockReturnValue({ id: "user1" });

    Parse.Object.extend.mockImplementation(() => function () {
      return {
        set: function (key, value) {
          this[key] = value;
        },
        save: function () {
  mockDB.push({
    get: (field) => this[field]
  });
},
      };
    });

    Parse.Query.mockImplementation(() => ({
      equalTo: jest.fn().mockReturnThis(),

      first: jest.fn(() => {
        return mockDB.find(f => f.movieId === 1) || null;
      }),

      find: jest.fn(() => mockDB),

    }));
  });

  test("fluxo completo: salvar → listar → remover", async () => {

    // salvar
    const saved = await saveFavorite({
      id: 1,
      title: "Filme A",
      poster_path: "/img.jpg"
    });

    expect(saved).toBe(true);

    // listar
    const list = await getFavorites();
    expect(list.length).toBe(1);

    // remover
    Parse.Query.mockImplementation(() => ({
      equalTo: jest.fn().mockReturnThis(),
      first: jest.fn(() => ({
        destroy: () => {
          mockDB = [];
        }
      }))
    }));

    const removed = await removeFavorite(1);
    expect(removed).toBe(true);

    // verificar lista vazia
    const listAfter = await getFavorites();
    expect(listAfter.length).toBe(0);
  });

});