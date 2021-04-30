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

  useEffect(() => {
    //gets the data from the API

    axios.get("/api/data").then((res) => {
      let data = res.data;
      data = data.filter((d) => d.from !== "" && d.to !== "");
      // extract mainGroup and subGroup using regex
      let processedData = data.map((d) => {
        let from = d.from;
        let fromGroup = from.match(numberExtractRegex) || ["0"];
        let to = d.to;
        let toGroup = to.match(numberExtractRegex) || ["0"];
        from = from.replace(` ${fromGroup[0]}`, "");
        // console.log(from);
        to = to.replace(` ${toGroup[0]}`, "");
        // console.log(to);
        return {
          from: { mainGroup: from, sub: fromGroup[0] },
          to: { mainGroup: to, sub: toGroup[0] },
        };
      });

      // create a new data format to keep track of expand or collapse groups
      let expandData = {};
      processedData.forEach((d) => {
        let from = d.from;
        let to = d.to;
        if (!(from.mainGroup in expandData)) {
          expandData[from.mainGroup] = {
            expand: false,
            subGroups: [from.sub],
            group: "from",
          };
        } else {
          expandData[from.mainGroup].subGroups.push(from.sub);
        }
        if (!(to.mainGroup in expandData)) {
          expandData[to.mainGroup] = {
            expand: false,
            subGroups: [to.sub],
            group: "to",
          };
        } else {
          expandData[from.mainGroup].subGroups.push(to.sub);
        }
      });
      setData(processedData);
      setExpandData(expandData);
    });
  }, []);

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
        let from_id;
        let to_id;
        // console.log(expandData[from.mainGroup]);
        if (expandData[from.mainGroup].expand) {
          from_id = `${from.mainGroup}_${from.sub}`;
        } else {
          // console.log(expandData[from.mainGroup].expand);
          // console.log("?");
          from_id = from.mainGroup;
        }
        if (expandData[to.mainGroup].expand) {
          to_id = `${to.mainGroup}_${to.sub}`;
        } else {
          to_id = to.mainGroup;
        }

        if (from_id in adj) {
          if (to_id in adj[from_id]) {
            adj[from_id][to_id]++;
          } else {
            adj[from_id][to_id] = 1;
          }
        } else {
          adj[from_id] = {};
          adj[from_id][to_id] = 1;
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
            value: adj[source][target],
          });
        });
      });
      // console.log(network);
      setNetworkData(network);
    }
  }, [data, expandData]);

  return (
    <div className="app" style={{ height: "100%" }}>
      <NavBar height={"8%"} className="navBar"></NavBar>
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
