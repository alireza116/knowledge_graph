import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import NavBar from "./components/nav/nav";
import * as d3 from "d3";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import NetworkGraph from "./components/network/network";
import "./App.css";

let borderColor = "grey";
let parseDate = d3.timeParse("%Y-%m-%d %H");
let numberExtractRegex = /\d+/g;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "grid",
    gridTemplateColumns: "repeat(12,1fr)",
    gridTemplateRows: "repeat(12,1fr)",
    height: "92%",
    margin: "0 auto",
    width: "100%",
    padding: 0,
    margin: 0,
  },
  networkVis: {
    gridColumn: "1 / 13",
    gridRow: "1 / 13",

    borderColor: borderColor,
  },
}));

const App = () => {
  const classes = useStyles();
  const [data, setData] = useState(() => []);
  const [file, setFile] = useState(() => null);
  const [expandData, setExpandData] = useState(() => {
    {
    }
  });
  const [networkData, setNetworkData] = useState(() => {
    {
    }
  });

  const handleExpand = (node) => {
    console.log(node);
    let expandCopy = Object.assign({}, expandData);
    expandCopy[node].expand = expandCopy[node].expand ? false : true;
    console.log(expandCopy[node]);
    setExpandData(expandCopy);
  };

  const handleUpload = (file) => {
    // const formData = new FormData();
    // formData.append("file", file);

    // axios.post("api/data", formData).then((res) => {
    //   //Now do what you want with the response;
    //   console.log(res);
    // });
    setFile(file);
  };

  useEffect(() => {
    //gets the data from the API
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    axios
      .post("/api/data", formData)
      .then((res) => {
        let data = res.data;
        data = data.filter(
          (d) => d.from.mainGroup !== "" && d.to.mainGroup !== ""
        );

        // create a new data format to keep track of expand or collapse groups
        let expandData = {};
        data.forEach((d) => {
          let from = d.from;
          let to = d.to;
          if (!(from.mainGroup in expandData)) {
            expandData[from.mainGroup] = {
              expand: false,
              subGroups: [from.subGroup],
              group: "from",
            };
          } else {
            expandData[from.mainGroup].subGroups.push(from.subGroup);
          }
          if (!(to.mainGroup in expandData)) {
            expandData[to.mainGroup] = {
              expand: false,
              subGroups: [to.subGroup],
              group: "to",
            };
          } else {
            expandData[from.mainGroup].subGroups.push(to.subGroup);
          }
        });
        setData(data);
        setExpandData(expandData);
      })
      .catch((res) => {
        console.log(res);
        alert("wrong file uploaded");
      });
  }, [file]);

  useEffect(() => {
    if (data && expandData) {
      console.log(expandData);
      console.log(data);
      let adj = {};
      let network = {
        nodes: [],
        links: [],
      };
      data.forEach((d) => {
        let from = d.from;
        let to = d.to;
        let value = +d.value;
        let weight = +d.weight || 1;
        let weighted_value = value * weight;
        // console.log(expandData[from.mainGroup]);

        let from_id = expandData[from.mainGroup].expand
          ? `${from.mainGroup}_${from.subGroup}`
          : from.mainGroup;

        let to_id = expandData[to.mainGroup].expand
          ? `${to.mainGroup}_${to.subGroup}`
          : to.mainGroup;

        if (from_id in adj) {
          if (to_id in adj[from_id]) {
            adj[from_id][to_id].count++;
            adj[from_id][to_id].weighted_value += weighted_value;
            adj[from_id][to_id].total_weight += weight;
          } else {
            adj[from_id][to_id] = {};
            adj[from_id][to_id].count = 1;
            adj[from_id][to_id].weighted_value = weighted_value;
            adj[from_id][to_id].total_weight = weight;
          }
        } else {
          adj[from_id] = {};
          adj[from_id][to_id] = {};
          adj[from_id][to_id].count = 1;
          adj[from_id][to_id].weighted_value = weighted_value;
          adj[from_id][to_id].total_weight = weight;
        }
      });
      console.log(adj);
      let uniqueNodes = new Set();
      Object.keys(adj).forEach((source) => {
        if (!uniqueNodes.has(source)) {
          let nodeSum = Object.entries(adj[source]).reduce((acc, curr) => {
            return acc + curr[1];
          }, 0);
          network.nodes.push({
            id: source,
            group: "from",
            mainGroup: source.split("_")[0],
            value: nodeSum,
          });
          uniqueNodes.add(source);
        }

        Object.keys(adj[source]).forEach((target) => {
          if (!uniqueNodes.has(target)) {
            network.nodes.push({
              id: target,
              group: "to",
              mainGroup: target.split("_")[0],
            });
            uniqueNodes.add(target);
          }

          network.links.push({
            source: source,
            target: target,
            edge_data: adj[source][target],
            weighted_value:
              adj[source][target].weighted_value /
              adj[source][target].total_weight,
          });
        });
      });
      // console.log(network);
      setNetworkData(network);
    }
  }, [data, expandData]);

  return (
    <div className="app" style={{ height: "100%" }}>
      <NavBar
        height={"8%"}
        className="navBar"
        handleUpload={handleUpload}
      ></NavBar>
      <Container className={classes.root} id="root-container" maxWidth={false}>
        <div className={classes.networkVis}>
          <NetworkGraph
            data={networkData}
            handleExpand={handleExpand}
          ></NetworkGraph>
        </div>
      </Container>
    </div>
  );
};

export default App;
