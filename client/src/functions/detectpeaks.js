import * as d3 from "d3";

function detectPeaks(data, accessor, options) {
  let { lookaround, sensitivity, coalesce, full } = Object.assign(
    {
      lookaround: 5,
      sensitivity: 1.5,
      coalesce: 5,
      full: false,
    },
    options || accessor
  );

  let peakiness = (left, value, right) => {
    // assume zero outside the boundary
    return value - d3.max([d3.min(left) || 0, d3.min(right) || 0]); // this can be max or mean.
  };

  let normalize = (xs) => {
    let mean = d3.mean(xs);
    let stdev = d3.deviation(xs);
    return xs.map((x) => (x - mean) / stdev);
  };

  let values = typeof accessor == "function" ? data.map(accessor) : data;

  //   console.log(values);

  // Compute a peakiness score for every sample value in `data`
  // We normalize the scale of the scores by mean-centering and dividing by the standard deviation
  // to get a dimensionless quantity such that can be used as a sensitivity parameter
  // across different scales of data (s. t. normalize(x) == normalize(k*x))
  let scores = normalize(
    values.map((value, index) =>
      peakiness(
        values.slice(d3.max(0, index - lookaround), index),
        value,
        values.slice(index + 1, index + lookaround + 1)
      )
    )
  );

  // Candidate peaks are indices whose score is above the sensitivity threshold
  let candidates = d3
    .range(scores.length)
    .filter((index) => scores[index] > sensitivity);

  // If we have multiple peaks, coalesce those that are close together
  let groups = candidates.length ? [[candidates[0]]] : [];
  //   console.log(candidates);
  d3.pairs(candidates).forEach(([a, b]) =>
    b - a < coalesce ? groups[groups.length - 1].push(b) : groups.push([b])
  );

  //   console.log(groups);

  // Represent every group of peaks by the highest peak in the group
  let peaks = groups.map(
    (group) => group[d3.scan(group, (a, b) => values[b] - values[a])]
  );

  return full ? { data, values, scores, candidates, groups, peaks } : peaks;
}

export default detectPeaks;
