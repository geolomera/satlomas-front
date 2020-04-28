import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import MenuItem from "@material-ui/core/MenuItem";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import AccountCircle from "@material-ui/icons/AccountCircle";
import Menu from "@material-ui/core/Menu";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import { withNamespaces, i18n } from "../i18n";
import { logout } from "../utils/auth";
import { buildApiUrl } from "../utils/api";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import axios from "axios";
import cookie from "js-cookie";

const styles = (theme) => ({
  appBar: {
    position: "relative",
  },
  menuItem: {
    minWidth: 150,
  },
  icon: {
    marginRight: theme.spacing.unit * 2,
  },
  heroUnit: {
    backgroundColor: theme.palette.background.paper,
  },
  heroContent: {
    maxWidth: 600,
    margin: "0 auto",
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`,
  },
  heroButtons: {
    marginTop: theme.spacing.unit * 4,
  },
  layout: {
    width: "auto",
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1100 + theme.spacing.unit * 3 * 2)]: {
      width: 1100,
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`,
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
    cursor: "pointer",
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing.unit * 6,
  },
  toolbarButtons: {
    marginLeft: 'auto',
  },
});

const cards = [
  {
    key: "green-map",
    title: "Cobertura verde en Lomas",
    description:
      "Mapa de cobertura verde de Lomas, basado en el producto VI de MODIS, actualizado mensualmente.",
    image: "",
    buttons: [{ name: "Ver", href: "/map-green-cover" }],
  },
  {
    key: "changes-map",
    title: "Cobertura de Lomas",
    description:
      "Mapa de cambios de cobertura de loma perdida y remanente, basado en las imágenes de los satélites Sentinel-1 y Sentinel-2, actualizado mensualmente.",
    image: "",
    buttons: [{ name: "Ver", href: "/map-changes" }],
  },
  {
    key: "stations-map",
    title: "Mapa de Estaciones",
    description:
      "Mapa con las estaciones meteorológicas instaladas actualmente",
    image: "/static/thumbs/stations-map.jpg",
    buttons: [{ name: "Ver", href: "/stations/map" }],
  },
  {
    key: "station-dashboard",
    title: "Dashboard de Estaciones",
    description:
      "Dashboard de las estaciones meteorológicas, con información actualizada en tiempo real.",
    image: "/static/thumbs/stations-dashboard.jpg",
    buttons: [{ name: "Dashboard", href: "/stations/dashboard" }, { name: "Tabla", href: "/stations/data" }],
  },
];

class Index extends React.Component {
  state = {
    section: null,
    beta: false,
    contextualMenuOpen: null,
    username: ""
  }

  static async getInitialProps({ query }) {
    return {
      namespacesRequired: ["me", "common"],
      query: query,
    };
  }

  constructor(props) {
    super(props);

    let { section } = props.query;

    // Set current section based on path
    if (section && sortedSections.includes(section)) {
      this.state.section = section;
    }
  }

  componentDidMount() {
    this.getUserName();
  }

  async getUserName() {
    const token = cookie.get("token");
    try {
      const response = await axios.get(buildApiUrl("/auth/user/"), {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token,
        },
      });
      const {
        username
      } = response.data;
      this.setState({ username });
    } catch (error) {
      console.error(error);
    }
  }

  handleContextualMenuClose = () => {
    this.setState({ contextualMenuOpen: null });
  }

  handleContextualMenuClick = (event) => {
    this.setState({ contextualMenuOpen: event.currentTarget });
  }

  profileLogout = () => {
    logout();
  }

  menuDashboardClick = () => {
    routerPush("/admin");
  }

  render(){
    const { classes, t } = this.props;
    const { contextualMenuOpen, username } = this.state;

    return(
      <React.Fragment>
        <Head>
          <title>GeoLomas</title>
        </Head>
        <CssBaseline />
        <AppBar
          position="static" 
          className={classes.appBar}
        >
          <Toolbar>
            {/* <CameraIcon className={classes.icon} /> */}
            <Typography variant="h6" color="inherit" noWrap>
              GeoLomas
            </Typography>
            <div className={classes.toolbarButtons}>
            { username != "" ? 
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
                onClick={this.handleContextualMenuClick}
              >
                <AccountCircle />
              </IconButton>
              :
              <Button variant="contained"
              onClick={() => Router.push("/login")}>
                Login
            </Button>
            }
              <Menu
                anchorEl={contextualMenuOpen}
                keepMounted
                open={Boolean(contextualMenuOpen)}
                onClose={this.handleContextualMenuClose}
              >
                <MenuItem className={classes.menuItem}>
                  {username}
                </MenuItem>
                <MenuItem className={classes.menuItem}
                onClick={() => Router.push("/admin")}>
                Dashboard
                </MenuItem>
                <MenuItem className={classes.menuItem} 
                onClick={this.profileLogout} 
                >
                  {t("common:logout_btn")}
                  <ListItemSecondaryAction>
                    <ListItemIcon edge="end" aria-label="logout">
                      <PowerSettingsNewIcon />
                    </ListItemIcon>
                  </ListItemSecondaryAction>
                </MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        <main>
          {/* Hero unit */}
          <div className={classes.heroUnit}>
            <div className={classes.heroContent}>
              <Typography
                component="h1"
                variant="h2"
                align="center"
                color="textPrimary"
                gutterBottom
              >
                GeoLomas
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="textSecondary"
                paragraph
              >
                Something short and leading about the collection below—its contents,
                the creator, etc. Make it short and sweet, but not too short so
                folks don&apos;t simply skip over it entirely.
              </Typography>
              <div className={classes.heroButtons}>
                <Grid container spacing={16} justify="center">
                  <Grid item>
                    <Button variant="contained" color="primary">
                      Más información
                    </Button>
                  </Grid>
                  {/* <Grid item>
                      <Button variant="outlined" color="primary">
                        Secondary action
                      </Button>
                    </Grid> */}
                </Grid>
              </div>
            </div>
          </div>
          <div className={classNames(classes.layout, classes.cardGrid)}>
            {/* End hero unit */}
            <Grid container spacing={40}>
              {cards.map((card) => (
                <Grid item key={card.key} sm={6} md={4} lg={3}>
                  <Card className={classes.card}>
                    <Link href={card.buttons[0].href}>
                      <CardMedia
                        className={classes.cardMedia}
                        image={card.image}
                        title="Screenshot"
                      />
                    </Link>
                    <CardContent className={classes.cardContent}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {card.title}
                      </Typography>
                      <Typography>{card.description}</Typography>
                    </CardContent>
                    <CardActions>
                      {card.buttons.map(button => (<Button
                        key={button.name}
                        size="small"
                        color="primary"
                        onClick={() => Router.push(button.href)}
                      >
                        {button.name}
                      </Button>))}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </main>
        {/* Footer */}
        <footer className={classes.footer}>
          <Typography variant="h6" align="center" gutterBottom>
            Footer
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="textSecondary"
            component="p"
          >
            Something here to give the footer a purpose!
          </Typography>
        </footer>
        {/* End footer */}
      </React.Fragment>
    );
  }
}


Index.propTypes = {
  classes: PropTypes.object.isRequired,
};
Index = withNamespaces(["me", "common"])(Index);
Index = withStyles(styles)(Index);

export default Index;
