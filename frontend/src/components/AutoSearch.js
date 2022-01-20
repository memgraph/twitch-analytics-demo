import _ from "lodash";
import React, { useState } from "react";
import { Search, Grid, Label, Button } from "semantic-ui-react";

const initialState = {
  loading: false,
  results: [],
  value: "",
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
const resultRenderer = ({ title }) => <Label color="orange" content={title} />;

function AutoSearch(props) {
  const [state, dispatch] = React.useReducer(exampleReducer, initialState);
  const { loading, results, value } = state;
  const [hasError, setErrors] = useState(false);
  const [streamers, setStreamers] = useState({});

  const handleClick = () => {
    if (value !== "") props.updateStateParent(value);
  };

  async function fetchNames() {
    const res = await fetch("/streamers");
    res
      .json()
      .then((res) => setStreamers(res.streamers))
      .catch((err) => setErrors(err));
    console.log("Fetched names");
  }

  React.useEffect(() => {
    fetchNames();
    console.log("Fetched names again");
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
          results: _.filter(streamers, isMatch),
        });
      }, 300);
    },
    [streamers]
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
        <Grid.Column width={7}>
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
        <Grid.Column width={4}>
          <Button onClick={handleClick} content="Get graph" />
        </Grid.Column>
      </Grid>
    );
  }
}

export default AutoSearch;
