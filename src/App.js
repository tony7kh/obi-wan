import "./App.css";
import React, { useState } from "react";
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { Provider, connect } from "react-redux";

function promiseReducer(state, { type, status, name, payload, error }) {
  if (state === undefined) {
    return {};
  }

  if (type === "PROMISE") {
    return {
      ...state,
      [name]: { status, payload, error },
    };
  }

  return state;
}

const store = createStore(promiseReducer, applyMiddleware(thunk));
store.subscribe(() => console.log(store.getState()));

const actionPending = (name) => ({ type: "PROMISE", status: "PENDING", name });
const actionFulfilled = (name, payload) => ({
  type: "PROMISE",
  status: "FULFILLED",
  name,
  payload,
});
const actionRejected = (name, error) => ({
  type: "PROMISE",
  status: "REJECTED",
  name,
  error,
});

const actionPromise = (name, promise) => async (dispatch) => {
  dispatch(actionPending(name));
  try {
    const payload = await promise;
    dispatch(actionFulfilled(name, payload));
    return payload;
  } catch (err) {
    dispatch(actionRejected(name, err));
  }
};

const urlToObiWan = "https://swapi.dev/api/people/10";
const urlToFilm = "https://swapi.dev/api/films/1/";

store.dispatch(actionPromise("ObiWan", fetchData(urlToObiWan)));
store.dispatch(actionPromise("Film", fetchData(urlToFilm)));

const Hero = ({ status, payload, error }) => {
  return (
    <div className="hero">
      {status === "FULFILLED" ? (
        <>
          <h3>{payload.name}</h3>
          <p>
            birth year: <b>{payload.birth_year}</b>
          </p>
          <p>
            gender: <b>{payload.gender}</b>
          </p>
          <p>
            height: <b>{payload.height}</b>
          </p>
          <p>
            mass: <b>{payload.mass}</b>
          </p>
          <div className="films">
            <ul className="films__list">
              <b>films:</b>
              {payload.films.map((film) => (
                <li key={Math.random()}>{film.title}</li>
              ))}
            </ul>
          </div>
          <ul className="starships">
            <b>starships:</b>
            {payload.starships.map((starship) => (
              <li key={Math.random()}>{starship.name}</li>
            ))}
          </ul>
        </>
      ) : (
        "Loading. Please wait..."
      )}
      {status === "REJECTED" && (
        <>
          <strong>ERROR</strong>: {error}
        </>
      )}
    </div>
  );
};

const Film = ({ status, payload, error }) => {
  return (
    <div className="film">
      {status === "FULFILLED" ? (
        <>
          <h2>{payload.title}</h2>
          <h5>{payload.opening_crawl}</h5>
          <p>
            date of release: <b>{payload.release_date}</b>
          </p>
          <p>
            director: <b>{payload.director}</b>
          </p>
          <ul className="characters">
            <b>characters:</b>
            {payload.characters.map((character) => (
              <li key={Math.random()}>{character.name}</li>
            ))}
          </ul>
          <ul className="species">
            <b>species:</b>
            {payload.species.map((specie) => (
              <li key={Math.random()}>{specie.name}</li>
            ))}
          </ul>
        </>
      ) : (
        "Loading. Please wait..."
      )}
      {status === "REJECTED" && (
        <>
          <strong>ERROR</strong>: {error}
          <br />
        </>
      )}
    </div>
  );
};
async function fetchData(url) {
  const data = await fetch(url);
  const dataJSON = await data.json();
  const resultJSON = {};
  for (const objectItem of Object.entries(dataJSON)) {
    if (!Array.isArray(objectItem[1])) {
      resultJSON[objectItem[0]] = objectItem[1];
    } else {
      const requests = objectItem[1].map(async (url) => {
        const res = await fetch(url);
        return res;
      });
      const responses = await Promise.all(requests);
      const json = await Promise.all(responses.map((result) => result.json()));
      resultJSON[objectItem[0]] = json;
    }
  }

  return resultJSON;
}


const CObiWan = connect((state) => state.ObiWan || {})(Hero);
const CFilm = connect((state) => state.Film || {})(Film);

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <CObiWan />
        <hr />
        <CFilm />
      </div>
    </Provider>
  );
}

export default App;
