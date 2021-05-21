import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import "d3-selection-multi";

/* Component */
const NetworkChart = (props) => {
  const d3Container = useRef(null);
  const svg = useRef(null);
  const container = useRef(null);
  const nodeContainer = useRef(null);
  const linkContainer = useRef(null);
  const labelContainer = useRef(null);
  //   const w = useRef(null);
  //   const h = useRef(null);
  // console.log(props.handleExpand);

  let color = d3.scaleOrdinal(d3.schemeCategory10);
  //   const margins = useRef(null);
  const width = props.width || "100%";
  const height = props.height || "100%";
  const [fixed, setfixed] = useState(false);

  useEffect(() => {
    if (d3Container.current) {
      //svg returned by this component
      svg.current = d3.select(d3Container.current);

      svg.current
        .append("defs")
        .append("marker")
        .attrs({
          id: "arrowhead",
          viewBox: "-0 -5 10 10",
          refX: 15,
          refY: 0,
          orient: "auto",
          markerUnits: "userSpaceOnUse",
          markerWidth: 13,
          markerHeight: 13,
          xoverflow: "visible",
        })
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "black")
        .style("stroke", "none");

      container.current = svg.current.append("g");
      linkContainer.current = container.current.append("g");
      nodeContainer.current = container.current.append("g");
      labelContainer.current = container.current.append("g");

      // svg.current
      //   .append("rect")
      //   .attrs({ x: 10, y: 10, width: 100, height: 40, fill: "teal" })
      //   .on("click", () => {
      //     console.log("asdasd");
      //     console.log(fixed);
      //     d3.selectAll(".node").classed(() => {
      //       console.log(fixed);
      //       return !fixed;
      //     });
      //     setfixed(!fixed);
      //   });

      svg.current.call(
        d3
          .zoom()
          .scaleExtent([0.1, 4])
          .on("zoom", function () {
            container.current.attr("transform", d3.event.transform);
          })
      );

      svg.current.on("dblclick.zoom", null);
    }
  }, []);

  useEffect(() => {
    if (d3Container.current && props.data) {
      let graph = props.data;
      console.log(graph);
      const w = svg.current.node().getBoundingClientRect().width;
      //height of svg
      const h = svg.current.node().getBoundingClientRect().height;
      let label = {
        nodes: [],
        links: [],
      };

      let widthExtent = d3.extent(
        graph.links.map((d) => {
          return d.weighted_value;
        })
      );

      console.log(widthExtent);
      let widthScale = d3
        .scaleLinear()
        .domain([0, d3.max(widthExtent)])
        .range([1, 5]);

      let edgeColorScale = d3
        .scaleLinear()
        .domain(widthExtent)
        .range(["red", "blue"]);

      graph.nodes.forEach(function (d, i) {
        label.nodes.push({ node: d });
        label.nodes.push({ node: d });
        label.links.push({
          source: i * 2,
          target: i * 2 + 1,
        });
      });

      var labelLayout = d3
        .forceSimulation(label.nodes)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("link", d3.forceLink(label.links).distance(0).strength(2));

      var graphLayout = d3
        .forceSimulation(graph.nodes)
        // .force("charge", d3.forceManyBody().strength(-6000))
        .force("charge", d3.forceManyBody().strength(-1000))
        .force("center", d3.forceCenter(w / 2, h / 2))
        // .force("x", d3.forceX(w / 2).strength(1))
        // .force("y", d3.forceY(h / 2).strength(1))
        .force(
          "link",
          d3.forceLink(graph.links).id(function (d) {
            return d.id;
          })
          // .distance(100)
          // .strength(1)
        )
        .on("tick", ticked);

      const drag = d3.drag().on("start", dragstart).on("drag", dragged);

      let adjlist = [];

      graph.links.forEach(function (d) {
        adjlist[d.source.index + "-" + d.target.index] = true;
        adjlist[d.target.index + "-" + d.source.index] = true;
      });

      let link = linkContainer.current
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .join("line")
        .attr("stroke", (d) => {
          return edgeColorScale(d.weighted_value);
        })
        .attr("stroke-width", (d) => {
          return widthScale(Math.abs(d.weighted_value));
        })
        .attr("marker-end", "url(#arrowhead)");

      let node = nodeContainer.current
        .attr("class", "nodes")
        .selectAll("circle")
        .data(graph.nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", function (d) {
          return color(d.mainGroup);
        })
        .classed("node", true)
        .classed("fixed", (d) => d.fx !== undefined)
        .on("click", click)
        .call(
          drag
          // .on("end", dragended)
        );

      var labelNode = labelContainer.current
        .attr("class", "labelNodes")
        .selectAll("text")
        .data(label.nodes)
        .join("text")
        .text(function (d, i) {
          return i % 2 == 0 ? "" : d.node.id;
        })
        .style("fill", "#555")
        .style("font-family", "Arial")
        .style("font-size", 12)
        .style("pointer-events", "none"); // to prevent mouseover/drag capture

      node.on("dblclick", (d) => {
        console.log(d);
        props.handleExpand(d.mainGroup);
      });

      node.on("mouseover", focus).on("mouseout", unfocus);

      // node;

      // node;

      function click(d) {
        delete d.fx;
        delete d.fy;
        console.log(d);
        d3.select(this).classed("fixed", false);
        graphLayout.alpha(1).restart();
      }

      node.on("mouseover", focus).on("mouseout", unfocus);

      function ticked() {
        // node.call(updateNode);
        // link.call(updateLink);
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

        labelLayout.alphaTarget(0.3).restart();
        labelNode.each(function (d, i) {
          if (i % 2 == 0) {
            d.x = d.node.x;
            d.y = d.node.y;
          } else {
            var b = this.getBBox();

            var diffX = d.x - d.node.x;
            var diffY = d.y - d.node.y;

            var dist = Math.sqrt(diffX * diffX + diffY * diffY);

            var shiftX = (b.width * (diffX - dist)) / (dist * 2);
            shiftX = Math.max(-b.width, Math.min(0, shiftX));
            var shiftY = 16;
            this.setAttribute(
              "transform",
              "translate(" + shiftX + "," + shiftY + ")"
            );
          }
        });
        labelNode.call(updateNode);
      }

      function fixna(x) {
        if (isFinite(x)) return x;
        return 0;
      }

      function focus(d) {
        var index = d3.select(d3.event.target).datum().index;
        node.style("opacity", function (o) {
          return neigh(index, o.index) ? 1 : 0.1;
        });
        labelNode.attr("display", function (o) {
          return neigh(index, o.node.index) ? "block" : "none";
        });
        link.style("opacity", function (o) {
          return o.source.index == index || o.target.index == index ? 1 : 0.1;
        });
      }

      function unfocus() {
        labelNode.attr("display", "block");
        node.style("opacity", 1);
        link.style("opacity", 1);
      }

      // function updateLink(link) {
      //   link
      //     .attr("x1", function (d) {
      //       return fixna(d.source.x);
      //     })
      //     .attr("y1", function (d) {
      //       return fixna(d.source.y);
      //     })
      //     .attr("x2", function (d) {
      //       return fixna(d.target.x);
      //     })
      //     .attr("y2", function (d) {
      //       return fixna(d.target.y);
      //     });
      // }

      function updateNode(node) {
        node.attr("transform", function (d) {
          return "translate(" + fixna(d.x) + "," + fixna(d.y) + ")";
        });
      }

      function dragstart(d) {
        // d3.event.sourceEvent.stopPropagation();
        // if (!d3.event.active) graphLayout.alphaTarget(0.3).restart();
        // d.fx = d.x;
        // d.fy = d.y;
        d3.select(this).classed("fixed", true);
      }

      function dragged(d) {
        d.fx = clamp(d3.event.x, 0, w);
        d.fy = clamp(d3.event.y, 0, h);
        console.log(d);
        graphLayout.alpha(1).restart();
      }

      // function dragended(d) {
      //   if (!d3.event.active) graphLayout.alphaTarget(0);
      //   d.fx = null;
      //   d.fy = null;
      // }

      function neigh(a, b) {
        return a == b || adjlist[a + "-" + b];
      }
    }
  }, [props.data]);

  return (
    <div
      className="networkContainer"
      style={{
        width: width,
        height: height,
        margin: "0 auto",
        marginBottom: "10px",
      }}
    >
      <svg
        className="histComponent"
        style={{ cursor: "pointer" }}
        width={"100%"}
        height={"100%"}
        ref={d3Container}
      />
    </div>
  );
};

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

/* App */
export default NetworkChart;
