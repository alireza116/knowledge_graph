import React, { useEffect, useState } from "react";
import MaterialTable from "material-table";

const Table = (props) => {
  //   console.log(props);
  const [linkData, setLinkData] = useState(() => []);
  const [columns, setColumns] = useState(() => []);
  useEffect(() => {
    if (!props.data) return;
    console.log(props.data);
    let linkData = props.data.links.map((d) => {
      return {
        source: d.source.id,
        target: d.target.id,
        weight: d.edge_data.weighted_value / d.edge_data.total_weight,
        count: d.edge_data.count,
      };
    });
    let columns = Object.keys(linkData[0]).map((k) => {
      return { title: k, field: k };
    });
    console.log(linkData);
    setLinkData(linkData);
    setColumns(columns);
  }, [props.data]);
  return (
    <MaterialTable
      data={linkData}
      columns={columns}
      title="network data"
      maxBodyHeight="10vh"
    ></MaterialTable>
  );
};

export default Table;
