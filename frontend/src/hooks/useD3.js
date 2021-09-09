import React from "react";

import * as d3 from "d3";

export const useD3 = (renderGraph) => {
  const ref = React.useRef();

  React.useEffect(() => {
    renderGraph(d3.select(ref.current));

    return () => {};
  });

  return ref;
};
