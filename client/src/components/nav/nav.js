import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  offset: theme.mixins.toolbar,
  navBar: {
    height: "100%",
    backgroundColor: "grey",
  },
  allTweetsButton: {
    marginRight: "30px",
  },
}));

export default function NavBar(props) {
  const classes = useStyles();
  return (
    <div className={classes.root} style={{ height: props.height }}>
      <AppBar position="sticky" className={classes.navBar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Knowledge Graph
          </Typography>
          <Button variant="contained" component="label">
            Upload File
            <input
              type="file"
              hidden
              onChange={(e) => {
                console.log(e.target.files);
                props.handleUpload(e.target.files[0]);
              }}
            />
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
