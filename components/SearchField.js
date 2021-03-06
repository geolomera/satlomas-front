import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";

import { Paper, InputBase, IconButton } from '@material-ui/core';

const styles = {
  root: {
    padding: "2px 4px",
    margin: "10px",
    display: "flex",
    alignItems: "center",
    width: 340,
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
};

const SearchField = ({ classes, value, placeholder, onChange, onMenuClick }) => (
  <Paper className={classes.root} elevation={1}>
    <IconButton
      className={classes.iconButton}
      aria-label="Menu"
      onClick={onMenuClick}
    >
      <MenuIcon />
    </IconButton>
    <InputBase value={value} className={classes.input} placeholder={placeholder} onChange={onChange} />
    <IconButton className={classes.iconButton} aria-label="Search">
      <SearchIcon />
    </IconButton>
  </Paper>
);

SearchField.propTypes = {
  classes: PropTypes.object.isRequired,
  items: PropTypes.array,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onMenuClick: PropTypes.func,
};

SearchField.defaultProps = {
  items: [],
  placeholder: "Buscar por...",
  value: "",
  onChange: () => { },
  onMenuClick: () => { },
};

export default withStyles(styles)(SearchField);
