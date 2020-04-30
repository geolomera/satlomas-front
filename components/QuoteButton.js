import PropTypes from "prop-types";
import React from "react";
import { withTranslation } from "../i18n";
import { routerPush } from "../utils/router";
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';

const styles = theme => ({
  root: {
    margin: theme.spacing(1),
    width: "18%",
    position: "fixed",
    right: -65,
    top: 5,
    zIndex: 1000
  }
});

class QuoteButton extends React.Component {
  onClick = e => {
    const { isAuthenticated } = this.props;
    const href = isAuthenticated ? "/quote" : "/login?redirect=%2Fquote";
    routerPush(href);
  };

  render() {
    const { classes, t } = this.props;

    return (
      <div className={classes.root}>
        <Button variant="contained" color="secondary" onClick={this.onClick}>
          {t("quote_btn.value")}
        </Button>
      </div>
    );
  }
}

QuoteButton.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

QuoteButton.defaultProps = {
  isAuthenticated: false
};

QuoteButton = withStyles(styles)(QuoteButton);
QuoteButton = withTranslation()(QuoteButton);

export default QuoteButton;
