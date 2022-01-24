import _ from "lodash";
import React, { useState } from "react";
import { Search, Grid, Label, Button } from "semantic-ui-react";

const initialState = {
  loading: false,
  results: [],
  value: "",
};

const initialStateLanguage = {
  loadingLang: false,
  resultsLang: [],
  valueLang: "",
};

function exampleReducer(state, action) {
  switch (action.type) {
    case "CLEAN_QUERY":
      return initialState;
    case "START_SEARCH":
      return { ...state, loading: true, value: action.query };
    case "FINISH_SEARCH":
      return { ...state, loading: false, results: action.results };
    case "UPDATE_SELECTION":
      return { ...state, value: action.selection };

    default:
      throw new Error();
  }
}

function exampleReducerL(state, action) {
  switch (action.type) {
    case "CLEAN_QUERY":
      return initialStateLanguage;
    case "START_SEARCH":
      return { ...state, loadingLang: true, valueLang: action.query };
    case "FINISH_SEARCH":
      return { ...state, loadingLang: false, resultsLang: action.results };
    case "UPDATE_SELECTION":
      return { ...state, valueLang: action.selection };

    default:
      throw new Error();
  }
}
const resultRenderer = ({ title }) => <Label color="orange" content={title} />;
const resultRendererL = ({ title }) => <Label color="orange" content={title} />;

function AutoCompleteGame(props) {
  const [state, dispatch] = React.useReducer(exampleReducer, initialState);
  const [stateLang, dispatchLanguage] = React.useReducer(
    exampleReducerL,
    initialStateLanguage
  );
  const { loadingLang, resultsLang, valueLang } = stateLang;
  const { loading, results, value } = state;
  const [hasError, setErrors] = useState(false);
  const [games, setGames] = useState({});
  const [languages, setLanguages] = useState({});

  const handleClick = () => {
    if (value !== "" && valueLang !== "")
      props.updateStateParent(value, valueLang);
  };

  async function fetchLanguages() {
    const res = await fetch("/languages");
    res
      .json()
      .then((res) => setLanguages(res.languages))
      .catch((err) => setErrors(err));
  }

  async function fetchGames() {
    const res = await fetch("/games");
    res
      .json()
      .then((res) => setGames(res.games))
      .catch((err) => setErrors(err));
  }

  React.useEffect(() => {
    fetchGames();
    fetchLanguages();
  }, []);

  const timeoutRef = React.useRef();
  const handleSearchChange = React.useCallback(
    (e, data) => {
      clearTimeout(timeoutRef.current);
      dispatch({ type: "START_SEARCH", query: data.value });

      timeoutRef.current = setTimeout(() => {
        if (data.value.length === 0) {
          dispatch({ type: "CLEAN_QUERY" });
          return;
        }

        const re = new RegExp(_.escapeRegExp(data.value), "i");
        console.log(re);
        const isMatch = (result) => re.test(result.title);

        dispatch({
          type: "FINISH_SEARCH",
          results: _.filter(games, isMatch),
        });
      }, 300);
    },
    [games]
  );

  const handleSearchChangeL = React.useCallback(
    (e, data) => {
      clearTimeout(timeoutRef.current);
      dispatchLanguage({ type: "START_SEARCH", query: data.value });

      timeoutRef.current = setTimeout(() => {
        if (data.value.length === 0) {
          dispatchLanguage({ type: "CLEAN_QUERY" });
          return;
        }

        const re = new RegExp(_.escapeRegExp(data.value), "i");
        console.log(re);
        const isMatch = (result) => re.test(result.title);

        dispatchLanguage({
          type: "FINISH_SEARCH",
          results: _.filter(languages, isMatch),
        });
      }, 300);
    },
    [languages]
  );

  React.useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  if (hasError) {
    return <div>Error: {hasError.message}</div>;
  } else {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={6}>
            <Search
              loading={loading}
              onResultSelect={(e, data) =>
                dispatch({
                  type: "UPDATE_SELECTION",
                  selection: data.result.title,
                })
              }
              onSearchChange={handleSearchChange}
              resultRenderer={resultRenderer}
              results={results}
              value={value}
            />
          </Grid.Column>
          <Grid.Column width={3}>
            <Label pointing="left">Pick a game</Label>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={6}>
            <Search
              loading={loadingLang}
              onResultSelect={(e, data) =>
                dispatchLanguage({
                  type: "UPDATE_SELECTION",
                  selection: data.result.title,
                })
              }
              onSearchChange={handleSearchChangeL}
              resultRenderer={resultRendererL}
              results={resultsLang}
              value={valueLang}
            />
          </Grid.Column>
          <Grid.Column width={3}>
            <Label pointing="left">Pick a language</Label>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={10} centered>
            <Button onClick={handleClick} content="Get graph" />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default AutoCompleteGame;
